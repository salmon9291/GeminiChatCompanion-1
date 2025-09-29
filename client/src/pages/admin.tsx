import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings, Key, Eye, EyeOff } from "lucide-react";

interface ApiKeys {
  geminiApiKey: string;
  openaiApiKey: string;
}

function Admin() {
  const { toast } = useToast();
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");

  const { data: apiKeys, isLoading } = useQuery<ApiKeys>({
    queryKey: ['/api/admin/keys'],
  });

  const updateKeysMutation = useMutation({
    mutationFn: (keys: ApiKeys) =>
      apiRequest('/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify(keys),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      toast({
        title: "API Keys actualizadas",
        description: "Las claves de API se han guardado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/keys'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron guardar las API keys.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (apiKeys) {
      setGeminiKey(apiKeys.geminiApiKey || "");
      setOpenaiKey(apiKeys.openaiApiKey || "");
    }
  }, [apiKeys]);

  const handleSave = () => {
    if (!geminiKey.trim() && !openaiKey.trim()) {
      toast({
        title: "Error de validación",
        description: "Al menos una API key debe estar configurada.",
        variant: "destructive",
      });
      return;
    }

    updateKeysMutation.mutate({
      geminiApiKey: geminiKey.trim(),
      openaiApiKey: openaiKey.trim(),
    });
  };

  const testConnection = async (service: 'gemini' | 'openai') => {
    try {
      const response = await apiRequest(`/api/admin/test/${service}`, {
        method: 'POST',
      });
      const result = await response.text();
      toast({
        title: "Prueba exitosa",
        description: `Conexión con ${service === 'gemini' ? 'Gemini' : 'OpenAI'} funcionando correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: `No se pudo conectar con ${service === 'gemini' ? 'Gemini' : 'OpenAI'}. Verifica la API key.`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Settings className="h-12 w-12 text-white mr-3" />
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
          </div>
          <p className="text-gray-400">Configura las API keys para el asistente de IA</p>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Key className="h-5 w-5 mr-2" />
              Configuración de API Keys
            </CardTitle>
            <CardDescription className="text-gray-400">
              Ingresa las claves de API para los servicios de inteligencia artificial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gemini API Key */}
            <div className="space-y-2">
              <Label htmlFor="gemini-key" className="text-white">
                Google Gemini API Key
              </Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="gemini-key"
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Ingresa tu Gemini API key"
                    className="bg-gray-800 border-gray-600 text-white pr-10"
                    data-testid="input-gemini-key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    data-testid="button-toggle-gemini-visibility"
                  >
                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  onClick={() => testConnection('gemini')}
                  disabled={!geminiKey.trim()}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                  data-testid="button-test-gemini"
                >
                  Probar
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Obtén tu clave en{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="text-white">
                OpenAI API Key
              </Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="openai-key"
                    type={showOpenaiKey ? "text" : "password"}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="Ingresa tu OpenAI API key"
                    className="bg-gray-800 border-gray-600 text-white pr-10"
                    data-testid="input-openai-key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    data-testid="button-toggle-openai-visibility"
                  >
                    {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  onClick={() => testConnection('openai')}
                  disabled={!openaiKey.trim()}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                  data-testid="button-test-openai"
                >
                  Probar
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Obtén tu clave en{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleSave}
                disabled={updateKeysMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-keys"
              >
                {updateKeysMutation.isPending ? "Guardando..." : "Guardar Configuración"}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="border-gray-600 text-white hover:bg-gray-800"
                data-testid="button-back-to-chat"
              >
                Volver al Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">!</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-yellow-400 font-medium">Nota de Seguridad</h3>
              <p className="text-yellow-200 text-sm mt-1">
                Las API keys se almacenan localmente en el servidor. Para mayor seguridad en producción, 
                considera usar variables de entorno o sistemas de gestión de secretos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;