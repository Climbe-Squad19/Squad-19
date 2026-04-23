import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile } from '../store/profileSlice';
import { ProfileFormValues, profileSchema } from '../features/profile/profileSchema';
import { maskDocument, maskPhone } from '../utils/masks';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);
  const [savedMessage, setSavedMessage] = useState('');
  const wasOpenRef = useRef(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
      company: profile.company,
      phone: profile.phone,
      documentType: profile.documentType,
      documentNumber: profile.documentNumber,
    },
  });

  const documentType = watch('documentType');
  const documentNumberVal = watch('documentNumber');
  const docMasked =
    documentNumberVal.trim() === '***' || documentNumberVal.startsWith('***');

  /** Só sincroniza ao abrir o drawer — evita reset a cada GET /auth/me (parecia edição/flicker). */
  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!justOpened) {
      return;
    }
    reset({
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
      company: profile.company,
      phone: profile.phone,
      documentType: profile.documentType,
      documentNumber: profile.documentNumber,
    });
    setSavedMessage('');
  }, [open, profile, reset]);

  const initials = profile.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  async function onSubmit(values: ProfileFormValues) {
    dispatch(
      updateProfile({
        ...profile,
        ...values,
        role: profile.role,
      })
    );
    setSavedMessage('Perfil atualizado com sucesso.');
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 460 },
            background: '#0b1220',
            color: '#edf2f7',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
          },
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3, display: 'grid', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: '#4cc9f0', color: '#04121f', fontWeight: 700 }}>{initials}</Avatar>
          <Box>
            <Typography variant="h6">Meu perfil</Typography>
            <Typography variant="body2" sx={{ color: '#9ab0d6' }}>
              Atualize os dados da conta com validacao, mascara e estado global.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={profile.status} sx={{ bgcolor: 'rgba(102,247,217,0.14)', color: '#7dfdd4' }} />
          <Chip label={profile.role} sx={{ bgcolor: 'rgba(63,169,255,0.14)', color: '#9ad5ff' }} />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {savedMessage && <Alert severity="success">{savedMessage}</Alert>}

        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Nome completo" error={!!errors.fullName} helperText={errors.fullName?.message} fullWidth />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="E-mail" error={!!errors.email} helperText={errors.email?.message} fullWidth />
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Cargo"
              error={!!errors.role}
              helperText="Definido pela organização (somente leitura)."
              fullWidth
              slotProps={{
                input: { readOnly: true },
              }}
              sx={{ '& .MuiInputBase-input': { cursor: 'default' } }}
            />
          )}
        />

        <Controller
          name="company"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Empresa" error={!!errors.company} helperText={errors.company?.message} fullWidth />
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Telefone"
              value={field.value}
              onChange={(event) => field.onChange(maskPhone(event.target.value))}
              error={!!errors.phone}
              helperText={errors.phone?.message ?? 'Formato: (99) 99999-9999'}
              fullWidth
            />
          )}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Controller
            name="documentType"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Tipo de documento"
                fullWidth
                disabled={docMasked}
                helperText={docMasked ? 'Definido no cadastro.' : undefined}
              >
                <MenuItem value="CPF">CPF</MenuItem>
                <MenuItem value="CNPJ">CNPJ</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="documentNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={documentType}
                value={field.value}
                onChange={(event) => field.onChange(maskDocument(event.target.value, documentType))}
                error={!!errors.documentNumber}
                helperText={
                  docMasked
                    ? 'CPF/CNPJ completo não é exibido por privacidade.'
                    : errors.documentNumber?.message
                }
                fullWidth
                slotProps={{
                  input: { readOnly: docMasked },
                }}
                sx={docMasked ? { '& .MuiInputBase-input': { cursor: 'default' } } : undefined}
              />
            )}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={onClose} sx={{ borderColor: 'rgba(125,253,212,0.28)', color: '#dbe7ff' }}>
            Fechar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ background: 'linear-gradient(135deg, #66f7d9, #3fa9ff)', color: '#04121f' }}>
            Salvar perfil
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}