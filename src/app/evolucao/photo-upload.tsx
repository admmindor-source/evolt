'use client';

import { useRef, useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getPhotoUploadUrlAction, recordPhotoAction } from './actions';

export function PhotoUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');

    const result = await getPhotoUploadUrlAction(file.name, file.type);
    if ('error' in result) {
      setStatus('error');
      return;
    }

    try {
      const uploadRes = await fetch(result.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) {
        setStatus('error');
        return;
      }

      startTransition(async () => {
        await recordPhotoAction(result.path);
        setStatus('done');
      });
    } catch {
      setStatus('error');
    }
  }

  return (
    <Card>
      <p className="text-xs text-[color:var(--color-evolt-muted)] uppercase tracking-wide mb-3">
        Adicionar foto de progresso
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Selecionar foto de progresso"
      />
      {status === 'uploading' || isPending ? (
        <p className="text-sm text-[color:var(--color-evolt-muted)]">Enviando foto...</p>
      ) : status === 'done' ? (
        <div className="flex flex-col gap-2">
          <p role="status" className="text-sm text-green-400">Foto salva com sucesso.</p>
          <Button
            type="button"
            onClick={() => { setStatus('idle'); if (fileInputRef.current) fileInputRef.current.value = ''; }}
          >
            Adicionar outra
          </Button>
        </div>
      ) : status === 'error' ? (
        <div className="flex flex-col gap-2">
          <p role="alert" className="text-sm text-red-400">Erro ao enviar foto. Tente novamente.</p>
          <Button type="button" onClick={() => setStatus('idle')}>Tentar novamente</Button>
        </div>
      ) : (
        <Button type="button" onClick={() => fileInputRef.current?.click()}>
          Selecionar foto
        </Button>
      )}
    </Card>
  );
}
