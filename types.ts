export interface User {
  id: string;
  name: string;
  email: string;
  registry?: string;
}

export interface Patient {
  id: string;
  registry: string;
  name: string;
  cpf_cnpj: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface Prescription {
  id: string;
  date: string;
  professional: string;
  document_name: string;
}

export interface Consultation {
  id: string;
  date: string;
  professional: string;
  specialty: string;
  status: string;
}

export interface Specialty {
  id: string;
  name: string;
}

export interface Professional {
  id: string;
  name: string;
  specialties: { id: string, name: string }[];
}

export interface MedicalRecord {
  personalData: {
    fullName: string;
    birthDate: string;
    bloodType: string;
    cpf: string;
    email?: string;
    phone?: string;
  };
  allergies: string[];
  continuousMedications: string[];
  diagnosedConditions: string[];
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card';
  last4: string;
  brand: string;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending';
}

export interface Plan {
  name: string;
  status: 'active' | 'inactive' | string;
}