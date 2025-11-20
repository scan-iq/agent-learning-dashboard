/**
 * API Key Setup Component
 * Prompts users to enter their IRIS API key
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Key, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { setApiKey } from '@/lib/api-client';
import { toast } from 'sonner';

interface ApiKeySetupProps {
  onComplete: () => void;
}

export function ApiKeySetup({ onComplete }: ApiKeySetupProps) {
  const [apiKey, setApiKeyInput] = useState('');
  const [remember, setRemember] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk_live_')) {
      setError('Invalid API key format. Keys should start with "sk_live_"');
      return;
    }

    setIsValidating(true);

    try {
      // Test the API key by making a request
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'https://iris-prime-api.vercel.app'}/api/iris/analytics`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Invalid API key');
      }

      // Store the API key
      setApiKey(apiKey, remember);

      toast.success('API Key Configured', {
        description: 'Successfully connected to IRIS API',
      });

      onComplete();
    } catch (err) {
      console.error('API key validation error:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to validate API key');
      }
    } finally {
      if (isMounted.current) {
        setIsValidating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to IRIS Console</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your API key to connect to the IRIS analytics backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need an IRIS API key to access the dashboard. If you don't have one yet, you can
              create one from the{' '}
              <a
                href="/settings/api-keys"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                API Keys page
                <ExternalLink className="w-3 h-3" />
              </a>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk_live_..."
                value={apiKey}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="font-mono"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Your API key starts with <code className="bg-muted px-1 py-0.5 rounded">sk_live_</code>
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked === true)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember my API key (stored locally)
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isValidating}>
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Connect to IRIS
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-2">Getting Started</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Create an API key from the admin dashboard</li>
              <li>Copy the API key (it starts with sk_live_)</li>
              <li>Paste it above and click "Connect to IRIS"</li>
              <li>Start exploring your AI analytics!</li>
            </ol>
          </div>

          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Need help?{' '}
              <a
                href="https://github.com/ruvnet/iris-prime"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Documentation
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
