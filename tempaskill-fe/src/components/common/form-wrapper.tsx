import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import React from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";

interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: UseFormReturn<any>;
  error?: string;
  className?: string;
}

/**
 * Wrapper component for forms using React Hook Form
 * Provides form context and displays API errors
 *
 * @example
 * ```tsx
 * const methods = useForm({
 *   resolver: zodResolver(loginSchema)
 * });
 *
 * <FormWrapper
 *   methods={methods}
 *   onSubmit={handleSubmit(onSubmit)}
 *   error={apiError}
 * >
 *   <FormField name="email" label="Email" type="email" />
 *   <FormField name="password" label="Password" type="password" />
 *   <SubmitButton loading={isLoading}>Masuk</SubmitButton>
 * </FormWrapper>
 * ```
 */
export function FormWrapper({
  children,
  onSubmit,
  methods,
  error,
  className,
}: FormWrapperProps) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {children}
      </form>
    </FormProvider>
  );
}
