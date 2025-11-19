import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Key, Plus, Trash2, Copy, AlertCircle, Activity, ArrowLeft } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface ApiKey {
  id: string;
  projectId: string;
  projectName: string;
  prefix: string;
  label: string;
  lastUsedAt: string | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  revokedAt: string | null;
}

const ApiKeysPage = () => {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Form state for creating new key
  const [newKeyForm, setNewKeyForm] = useState({
    projectId: '',
    projectName: '',
    label: '',
  });

  // Get API base from env (should be set to your iris-prime-api URL)
  const apiBase = import.meta.env.VITE_API_BASE || 'https://iris-prime-api.vercel.app';
  const adminKey = import.meta.env.VITE_ADMIN_API_KEY;

  // Fetch API keys
  const fetchApiKeys = async () => {
    if (!adminKey) {
      toast.error('Admin API key not configured', {
        description: 'Set VITE_ADMIN_API_KEY in your environment',
      });
      setLoading(false);
      return;
    }

    // For now, we'll need a projectId - you can make this dynamic
    const projectId = 'default';

    try {
      const response = await fetch(`${apiBase}/api/admin/api-keys?projectId=${projectId}`, {
        headers: {
          'X-Admin-Key': adminKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.statusText}`);
      }

      const data = await response.json();
      setApiKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Create new API key
  const handleCreateKey = async () => {
    if (!newKeyForm.projectId || !newKeyForm.projectName || !newKeyForm.label) {
      toast.error('All fields are required');
      return;
    }

    if (!adminKey) {
      toast.error('Admin API key not configured');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/admin/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify({
          projectId: newKeyForm.projectId,
          projectName: newKeyForm.projectName,
          label: newKeyForm.label,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }

      const data = await response.json();

      // Show the newly created key (only time it's visible!)
      setNewlyCreatedKey(data.apiKey);
      setNewKeyDialogOpen(true);
      setCreateDialogOpen(false);

      // Reset form
      setNewKeyForm({
        projectId: '',
        projectName: '',
        label: '',
      });

      // Refresh the list
      await fetchApiKeys();

      toast.success('API key created successfully', {
        description: 'Make sure to copy it now - it won\'t be shown again!',
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Revoke API key
  const handleRevokeKey = async (keyId: string, label: string) => {
    if (!confirm(`Are you sure you want to revoke the API key "${label}"? This action cannot be undone.`)) {
      return;
    }

    if (!adminKey) {
      toast.error('Admin API key not configured');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/admin/api-keys`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify({ keyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      toast.success('API key revoked', {
        description: `"${label}" has been revoked and can no longer be used`,
      });

      // Refresh the list
      await fetchApiKeys();
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error('Failed to revoke API key', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Copy API key to clipboard
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-control-bg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="w-px h-6 bg-border" />
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-effect">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">IRIS Prime - API Keys</h1>
                <p className="text-sm text-muted-foreground">Manage API keys for IRIS Prime services</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Info Banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <CardTitle className="text-lg">About API Keys</CardTitle>
                  <CardDescription className="mt-2">
                    API keys allow your projects to authenticate with IRIS Prime services. Each key is associated with a project and can be revoked at any time.
                    API keys are only shown once when created - make sure to copy and store them securely.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* API Keys List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage access tokens for your IRIS Prime projects</CardDescription>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No API keys yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first API key to get started</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Key Prefix</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.label}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{key.projectName}</span>
                            <span className="text-xs text-muted-foreground">{key.projectId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{key.prefix}</code>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{key.usageCount.toLocaleString()} calls</span>
                        </TableCell>
                        <TableCell>
                          {key.lastUsedAt ? (
                            <span className="text-sm text-muted-foreground">
                              {formatDistance(new Date(key.lastUsedAt), new Date(), { addSuffix: true })}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {key.isActive ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">
                              Revoked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {key.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeKey(key.id, key.label)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for your IRIS Prime project. The key will only be shown once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                placeholder="my-project"
                value={newKeyForm.projectId}
                onChange={(e) => setNewKeyForm({ ...newKeyForm, projectId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Awesome Project"
                value={newKeyForm.projectName}
                onChange={(e) => setNewKeyForm({ ...newKeyForm, projectName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="Production, Development, CI/CD, etc."
                value={newKeyForm.label}
                onChange={(e) => setNewKeyForm({ ...newKeyForm, label: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                A descriptive label to identify this key's purpose
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey}>Create API Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show Newly Created Key Dialog */}
      <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created Successfully!</DialogTitle>
            <DialogDescription>
              Copy your API key now - it won't be shown again for security reasons.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono break-all">{newlyCreatedKey}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => newlyCreatedKey && handleCopyKey(newlyCreatedKey)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">
                <strong>Important:</strong> Store this key securely. You won't be able to see it again.
                If you lose it, you'll need to create a new one.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewKeyDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeysPage;
