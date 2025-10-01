import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { EyeIcon, EyeSlashIcon } from '../components/icons';

const LoginPage: React.FC = () => {
    type LoginType = 'cpf' | 'email' | 'phone';

    const [loginType, setLoginType] = useState<LoginType>('cpf');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLoginTypeChange = (type: LoginType) => {
        setLoginType(type);
        setIdentifier('');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const credentials = {
                password,
                email: loginType === 'email' ? identifier : undefined,
                phone: loginType === 'phone' ? identifier : undefined,
                cpf_cnpj: loginType === 'cpf' ? identifier : undefined,
                clinicUrl: "bonisaude.ailine.com.br"
            };
            await login(credentials, rememberMe);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Falha no login. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    const loginOptions: { key: LoginType; label: string; }[] = [
        { key: 'cpf', label: 'CPF' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Telefone' },
    ];

    const inputDetails = useMemo(() => ({
        cpf: { label: 'CPF', type: 'text', placeholder: '000.000.000-00' },
        email: { label: 'Email', type: 'email', placeholder: 'seu@email.com' },
        phone: { label: 'Telefone', type: 'tel', placeholder: '(00) 00000-0000' }
    }), []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <Card className="w-full max-w-md">
                <img src="https://storage.googleapis.com/genai-downloads/images/d37821c4b7261a86b9764de30e698822" alt="Boni Logo" className="h-12 w-auto mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Bem-vindo à Boni</h2>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                
                <form onSubmit={handleSubmit} noValidate>
                    <fieldset>
                        <legend className="sr-only">Escolha o método de login</legend>
                        <div className="flex justify-start items-center space-x-6 mb-4">
                            {loginOptions.map(option => (
                                 <label key={option.key} className="flex items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="loginType" 
                                        value={option.key} 
                                        checked={loginType === option.key} 
                                        onChange={() => handleLoginTypeChange(option.key)} 
                                        className="sr-only" 
                                    />
                                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${loginType === option.key ? 'border-purple-700 bg-purple-700' : 'border-purple-400'}`} aria-hidden="true">
                                        {loginType === option.key && <span className="w-2 h-2 bg-white rounded-full"></span>}
                                    </span>
                                    <span className="ml-2 text-gray-700">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">
                            {inputDetails[loginType].label}
                        </label>
                        <input 
                            className="shadow appearance-none border border-purple-200 rounded w-full py-2 px-3 text-gray-800 bg-white leading-tight focus:outline-none focus:shadow-outline" 
                            id="identifier" 
                            type={inputDetails[loginType].type} 
                            value={identifier} 
                            onChange={e => setIdentifier(e.target.value)} 
                            placeholder={inputDetails[loginType].placeholder}
                            required 
                            aria-label={`Insira seu ${inputDetails[loginType].label}`}
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Senha</label>
                        <div className="relative">
                            <input 
                                className="shadow appearance-none border border-purple-200 rounded w-full py-2 px-3 pr-10 text-gray-800 bg-white leading-tight focus:outline-none focus:shadow-outline" 
                                id="password" 
                                type={isPasswordVisible ? "text" : "password"} 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                                aria-label="Insira sua senha" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-start mb-6">
                        <label htmlFor="remember-me" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="remember-me"
                                    className="sr-only"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />
                                <div className={`block w-14 h-8 rounded-full transition-colors ${rememberMe ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${rememberMe ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-gray-700 font-medium">
                                Lembrar senha
                            </div>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-purple-300" type="submit" disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default LoginPage;