import { z } from 'zod';

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

export const profileSchema = z
  .object({
    fullName: z.string().min(3, 'Informe o nome completo.'),
    email: z.string().email('Informe um e-mail válido.'),
    role: z.string().min(2, 'Informe o cargo.'),
    company: z.string().min(2, 'Informe a empresa.'),
    phone: z.string().regex(phoneRegex, 'Telefone inválido.'),
    documentType: z.enum(['CPF', 'CNPJ']),
    documentNumber: z.string(),
  })
  .superRefine((value, ctx) => {
    const isValid = value.documentType === 'CPF' ? cpfRegex.test(value.documentNumber) : cnpjRegex.test(value.documentNumber);

    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['documentNumber'],
        message: `${value.documentType} inválido.`,
      });
    }
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;