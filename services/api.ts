import type { Consultation, MedicalRecord, Patient, Prescription, Professional, Specialty, User } from '../types';

const API_BASE_URL = 'https://api.ailine.com.br';

/**
 * A type for user-like objects used for identification in API calls.
 */
type UserIdentifier = { id: string; registry?: string; };

/**
 * Retrieves the JWT authentication token from local storage.
 * @returns {string | null} The JWT token or null if not found.
 */
const getAuthToken = (): string | null => {
    return localStorage.getItem('jwtToken');
};

/**
 * Handles authorization errors by logging the user out and redirecting to the login page.
 */
const handleAuthError = () => {
    // Clear user session data
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    // Redirect to login page. Using window.location to force a full app reload and context reset.
    // The hash (#) is necessary for HashRouter.
    window.location.href = '/#/login'; 
};


/**
 * A generic fetch wrapper for making authenticated requests to the Ailine API.
 * It automatically includes the user's JWT token and handles the standard API response format.
 * @param {string} endpoint - The API endpoint to call (e.g., '/integration/login').
 * @param {RequestInit} [options={}] - Standard fetch options (method, body, etc.).
 * @param {{ rawResponse?: boolean }} [apiOptions={}] - Options for the API handler itself.
 * @returns {Promise<any>} The `data` field from the API's JSON response, or the full body if rawResponse is true.
 * @throws {Error} If the network response is not ok, the API returns an error, or a network error occurs.
 */
const fetchApi = async (endpoint: string, options: RequestInit = {}, apiOptions: { rawResponse?: boolean } = {}): Promise<any> => {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // First, get the raw text of the response to avoid JSON parsing errors.
        const responseText = await response.text();
        
        // Handle responses that might not have a body (e.g., 204 No Content)
        if (!responseText) {
            if (response.status === 401 || response.status === 403) {
                 handleAuthError();
                 return new Promise(() => {});
            }
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText} (Status: ${response.status})`);
            }
            return null; // Successful request with no body
        }
        
        let body;

        try {
            // Then, try to parse it as JSON.
            body = JSON.parse(responseText);
        } catch (error) {
            // If parsing fails, but the status is an auth error, we should still handle it.
            if (response.status === 401 || response.status === 403) {
                 handleAuthError();
                 return new Promise(() => {});
            }
            // If parsing fails, the response was not valid JSON (e.g., an HTML error page).
            if (!response.ok) {
                // For failed HTTP requests, throw an error with the status.
                throw new Error(`Erro na requisição: ${response.statusText} (Status: ${response.status}). A resposta do servidor não é um JSON válido.`);
            }
            // If the request was successful (2xx status) but the body isn't JSON, it's an unexpected format.
            throw new Error('A resposta da API foi recebida, mas em um formato inesperado (não-JSON).');
        }

        // Centralized auth error handling.
        // Check for standard HTTP status codes OR specific error messages in the response body.
        const authErrorMessages = ['Usuário não autorizado', 'Token inválido', 'Sessão expirada'];
        const isAuthError = (response.status === 401 || response.status === 403) ||
                            (body && body.message && typeof body.message === 'string' && authErrorMessages.some(msg => body.message.includes(msg)));
        
        if (isAuthError) {
            handleAuthError();
            // Return a promise that never resolves to prevent component's .catch() from running
            return new Promise(() => {});
        }


        if (!response.ok) {
            // All other errors (e.g., 400, 404, 500) should be thrown. Auth errors were handled above.
            const errorMessage = body.message || `Erro na requisição: ${response.statusText} (Status: ${response.status})`;
            throw new Error(errorMessage);
        }

        // Check for API-level errors within a successful (2xx) response.
        if (body.type === 'error') {
            throw new Error(body.message || 'Ocorreu um erro na API.');
        }
        
        if (apiOptions.rawResponse) {
            return body;
        }

        // API response payload is in 'data' (camelCase), not 'Data' (PascalCase).
        if (body.data === undefined) {
             console.warn("API response missing 'data' field, returning full body:", body);
             return body; // Return the full body as a fallback if 'data' is missing
        }

        return body.data; // Return the actual data payload
    } catch (error: any) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão ou as configurações de segurança da rede (CORS).');
        }
        throw error;
    }
};

/**
 * The main API service object containing all methods for interacting with the Ailine API.
 */
export const api = {
    /**
     * Authenticates the user.
     * @param {any} credentials - The user's login credentials.
     * @returns {Promise<any>} The login response payload from the 'data' field, containing the JWT and user data.
     */
    login: async (credentials: any): Promise<any> => {
        const body = {
            email: credentials.email,
            cpf_cnpj: credentials.cpf_cnpj,
            phone: credentials.phone,
            password: credentials.password,
            clinicUrl: credentials.clinicUrl,
        };
        return fetchApi('/integration/login', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    /**
     * Fetches a list of patients.
     * @returns {Promise<Patient[]>} A list of patients.
     */
    getPatients: async (): Promise<Patient[]> => {
        const result = await fetchApi('/integration/holder/list/all', { method: 'GET' });
        return Array.isArray(result) ? result : []; // Ensure result is always an array
    },

    /**
     * Fetches a list of dependents for the logged-in user.
     * @returns {Promise<Patient[]>} A list of dependents.
     */
    getDependents: async (): Promise<Patient[]> => {
        const result = await fetchApi('/integration/holder/list/dependents', { method: 'GET' });
        return Array.isArray(result) ? result : []; // Ensure result is always an array
    },

    /**
     * Fetches the user's consultation and prescription history.
     * @param {UserIdentifier} user - Reference to the user (holder or dependent).
     * @returns {Promise<any[]>} The user's raw history list.
     */
    getHistory: async (user: UserIdentifier): Promise<any[]> => {
        // FIX: The API requires GET requests with parameters in the URL's query string.
        const endpoint = user.registry
            ? `/integration/holder/list/historic/queries/prescriptions/byRef?registry=${user.registry}`
            : `/integration/holder/list/historic/queries/prescriptions/byRef?holderID=${user.id}`;

        const result = await fetchApi(endpoint, {
            method: 'GET',
        });

        return Array.isArray(result) ? result : []; // Ensure result is always an array
    },
    
    /**
     * Fetches a downloadable URL for a given prescription.
     * @param {string} prescriptionId - The ID of the prescription/document.
     * @param {UserIdentifier} user - The user (holder or dependent) to whom the prescription belongs.
     * @returns {Promise<{ URL: string }>} An object containing the secure download URL.
     */
    downloadPrescription: async (prescriptionId: string, user: UserIdentifier): Promise<{ URL: string }> => {
        const requestBody = {
            idPrescription: prescriptionId,
            registry: user.registry,
            holderID: user.id // Send both for robustness; the API should use the one it needs.
        };
        
        const response = await fetchApi('/integration/download/prescription', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });
        
        if (!response || !response.URL) {
            throw new Error("A API não retornou um link válido para o download.");
        }

        return { URL: response.URL };
    },

    /**
     * Fetches the user's complete medical record.
     * @param {UserIdentifier} person - Reference to the user (holder or dependent).
     * @param {boolean} isHolder - Flag to explicitly determine if the person is the main account holder.
     * @returns {Promise<MedicalRecord>} The user's medical record.
     */
    getMedicalRecord: async (person: UserIdentifier, isHolder: boolean): Promise<MedicalRecord> => {
        // The previous logic was ambiguous if a holder also had a `registry` property.
        // This new implementation explicitly uses `holderID` for the holder and `registry` for dependents,
        // removing any ambiguity.

        // A dependent must have a registry to be identified.
        if (!isHolder && !person.registry) {
            throw new Error("O registro (registry) do dependente não foi encontrado, não é possível buscar o prontuário.");
        }
        
        const endpoint = isHolder
            ? `/integration/holder/medical-record/byRef?holderID=${person.id}`
            : `/integration/holder/medical-record/byRef?registry=${person.registry}`;
        
        return fetchApi(endpoint, {
            method: 'GET',
        });
    },

    /**
     * Initiates an immediate teleconsultation call.
     * @param {object} details - The call details, including complaint and optional file.
     * @param {string} details.complaint - The user's chief complaint.
     * @param {string} [details.file] - Optional Base64 encoded file.
     * @param {string} [details.extension_file] - Optional file extension.
     * @param {User} user - The logged-in user object.
     * @returns {Promise<{ URL: string }>} The URL for the teleconsultation.
     */
    startImmediateCall: async (details: { complaint: string; file?: string; extension_file?: string }, user: User): Promise<{ URL: string }> => {
        const requestBody: {
            complaint: string;
            file?: string;
            extension_file?: string;
            registry?: string;
            holderID?: string;
        } = {
            complaint: details.complaint,
            file: details.file,
            extension_file: details.extension_file,
        };

        if (user.registry) {
            requestBody.registry = user.registry;
        } else {
            requestBody.holderID = user.id;
        }

        const response = await fetchApi('/integration/startCall', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });
        
        if (!response || !response.URL) {
            throw new Error("A API não retornou uma URL para a chamada.");
        }
        
        return { URL: response.URL };
    },
    
    /**
     * Fetches the available medical specialties.
     * @returns {Promise<Specialty[]>} A list of specialties.
     */
    getSpecialties: async (): Promise<Specialty[]> => {
        const result = await fetchApi('/integration/specialties/list/scheduled', { method: 'GET' });
        return Array.isArray(result) ? result : []; // Ensure result is always an array
    },
    
    /**
     * Fetches the available healthcare professionals.
     * @returns {Promise<Professional[]>} A list of professionals.
     */
    getProfessionals: async (): Promise<Professional[]> => {
        const result = await fetchApi('/integration/professionals/list/scheduled', { method: 'GET' });
        return Array.isArray(result) ? result : []; // Ensure result is always an array
    },

    /**
     * Schedules a new teleconsultation.
     * @param {any} details - The details for the appointment.
     * @param {User} user - The logged-in user object.
     * @returns {Promise<{ URL: string }>} A confirmation or URL for the scheduled call.
     */
    scheduleCall: async (details: any, user: User): Promise<{ URL:string }> => {
        // FIX: Aligned with the latest API guide. The endpoint accepts 'registry' or 'holderID'.
        // Prioritizing 'registry' to ensure appointments are correctly linked for history lookup.
        const requestBody: any = {
            ...details,
        };

        if (user.registry) {
            requestBody.registry = user.registry;
        } else {
            requestBody.holderID = user.id;
        }

        const response = await fetchApi('/integration/scheduled/call', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });
        return { URL: response.URL };
    },

    /**
     * Fetches the complete details for the account holder, including plan info.
     * @param {string} holderId - The ID of the account holder.
     * @returns {Promise<any>} The detailed holder information.
     */
    getHolderDetails: async (holderId: string): Promise<any> => {
        return fetchApi(`/integration/holder/details/byRef?holderID=${holderId}`, {
            method: 'GET',
        });
    },

    /**
     * Adds a new dependent for the logged-in user.
     * @param {Partial<Patient>} dependentData - The data for the new dependent.
     * @returns {Promise<any>} The API response.
     */
    addDependent: async (dependentData: Partial<Patient>): Promise<any> => {
        return fetchApi('/integration/holder/dependents/create', {
            method: 'POST',
            body: JSON.stringify(dependentData),
        });
    },

    /**
     * Updates an existing dependent's information.
     * @param {Patient} dependentData - The full data for the dependent to update.
     * @returns {Promise<any>} The API response.
     */
    updateDependent: async (dependentData: Patient): Promise<any> => {
        return fetchApi('/integration/holder/dependents/update', {
            method: 'POST',
            body: JSON.stringify(dependentData),
        });
    },

    /**
     * Deletes a dependent.
     * @param {string} registry - The registry ID of the dependent to delete.
     * @returns {Promise<any>} The API response.
     */
    deleteDependent: async (registry: string): Promise<any> => {
        const requestBody = {
            registry: registry,
        };
        return fetchApi('/integration/holder/dependents/delete', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });
    },
};