# 📝 Form Components Guide

> Panduan lengkap untuk menggunakan reusable form components dengan React Hook Form + Zod

**Last Updated**: November 3, 2025

---

## 📦 Available Components

### 1. FormField

Input field dengan auto-validation dan error display

### 2. TextareaField

Textarea dengan auto-validation dan error display

### 3. SelectField

Select dropdown dengan auto-validation dan error display

### 4. NumberInput

Number input dengan thousand separator formatting (e.g., "Rp 1.000.000")

### 5. FormWrapper

Form wrapper dengan FormProvider dan API error handling

### 6. SubmitButton

Submit button dengan loading state built-in

---

## 🎯 Quick Start

### Installation

Components sudah tersedia di `src/components/common/`:

- `form-field.tsx` - FormField & TextareaField
- `form-wrapper.tsx` - FormWrapper
- `submit-button.tsx` - SubmitButton

### Basic Usage

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormWrapper, FormField, SubmitButton } from "@/components/common";
import { loginSchema } from "@/lib/validators";

export default function MyForm() {
  const methods = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <FormWrapper methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
      <FormField name="email" label="Email" type="email" />
      <FormField name="password" label="Password" type="password" />
      <SubmitButton fullWidth>Submit</SubmitButton>
    </FormWrapper>
  );
}
```

---

## 📘 API Reference

### FormField

**Props:**

| Prop          | Type                                                            | Default  | Description                        |
| ------------- | --------------------------------------------------------------- | -------- | ---------------------------------- |
| `name`        | `string`                                                        | Required | Field name (must match Zod schema) |
| `label`       | `string`                                                        | Required | Label text                         |
| `type`        | `"text" \| "email" \| "password" \| "number" \| "tel" \| "url"` | `"text"` | Input type                         |
| `description` | `string`                                                        | -        | Helper text below input            |
| `placeholder` | `string`                                                        | -        | Placeholder text                   |
| `disabled`    | `boolean`                                                       | `false`  | Disable input                      |
| `className`   | `string`                                                        | -        | Additional CSS classes             |

**Example:**

```tsx
<FormField
  name="email"
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  description="We'll never share your email"
  disabled={isLoading}
/>
```

**Features:**

- ✅ Auto-connects to React Hook Form
- ✅ Shows validation errors from Zod schema
- ✅ Red border on error
- ✅ Error message display
- ✅ Optional description text

---

### TextareaField

**Props:**

| Prop          | Type      | Default  | Description            |
| ------------- | --------- | -------- | ---------------------- |
| `name`        | `string`  | Required | Field name             |
| `label`       | `string`  | Required | Label text             |
| `description` | `string`  | -        | Helper text            |
| `placeholder` | `string`  | -        | Placeholder text       |
| `rows`        | `number`  | `4`      | Number of rows         |
| `disabled`    | `boolean` | `false`  | Disable textarea       |
| `className`   | `string`  | -        | Additional CSS classes |

**Example:**

```tsx
<TextareaField
  name="bio"
  label="Bio"
  placeholder="Tell us about yourself..."
  rows={6}
  description="Max 500 characters"
/>
```

---

### FormWrapper

**Props:**

| Prop        | Type                     | Default  | Description                                     |
| ----------- | ------------------------ | -------- | ----------------------------------------------- |
| `methods`   | `UseFormReturn`          | Required | React Hook Form methods from `useForm()`        |
| `onSubmit`  | `(e: FormEvent) => void` | Required | Submit handler (use `methods.handleSubmit(fn)`) |
| `error`     | `string`                 | -        | API error message to display                    |
| `className` | `string`                 | -        | Additional CSS classes                          |
| `children`  | `ReactNode`              | Required | Form fields                                     |

**Example:**

```tsx
const methods = useForm({ resolver: zodResolver(schema) });
const [apiError, setApiError] = useState("");

<FormWrapper
  methods={methods}
  onSubmit={methods.handleSubmit(onSubmit)}
  error={apiError}
>
  {/* Form fields here */}
</FormWrapper>;
```

**Features:**

- ✅ Provides FormProvider context
- ✅ Displays API errors in Alert component
- ✅ Handles form submission
- ✅ Consistent spacing (`space-y-4`)

---

### SubmitButton

**Props:**

| Prop          | Type            | Default          | Description            |
| ------------- | --------------- | ---------------- | ---------------------- |
| `loading`     | `boolean`       | `false`          | Show loading spinner   |
| `loadingText` | `string`        | `"Memproses..."` | Text during loading    |
| `fullWidth`   | `boolean`       | `false`          | Make button full width |
| `variant`     | `ButtonVariant` | `"default"`      | Button variant         |
| `size`        | `ButtonSize`    | `"default"`      | Button size            |
| `disabled`    | `boolean`       | `false`          | Disable button         |
| `children`    | `ReactNode`     | Required         | Button text            |

**Example:**

```tsx
<SubmitButton loading={mutation.isPending} loadingText="Menyimpan..." fullWidth>
  Simpan
</SubmitButton>
```

**Features:**

- ✅ Auto-disabled when loading
- ✅ Shows spinner during loading
- ✅ Orange brand color by default
- ✅ Customizable loading text

---

## 💡 Complete Examples

### Login Form

**File:** `src/app/(auth)/login/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { ROUTES, MESSAGES } from "@/lib/constants";
import { FormWrapper, FormField, SubmitButton } from "@/components/common";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [apiError, setApiError] = useState("");

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setApiError("");
    try {
      await login.mutateAsync(data);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setApiError("Email atau password salah");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Selamat Datang</CardTitle>
          <CardDescription>Masuk ke akun Anda</CardDescription>
        </CardHeader>

        <FormWrapper
          methods={methods}
          onSubmit={methods.handleSubmit(onSubmit)}
          error={apiError}
        >
          <CardContent className="space-y-4">
            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              disabled={login.isPending}
            />
            <FormField
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              disabled={login.isPending}
            />
          </CardContent>

          <CardFooter>
            <SubmitButton
              loading={login.isPending}
              loadingText="Masuk..."
              fullWidth
            >
              Masuk
            </SubmitButton>
          </CardFooter>
        </FormWrapper>
      </Card>
    </div>
  );
}
```

### Register Form

```tsx
export default function RegisterPage() {
  const methods = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <FormWrapper
      methods={methods}
      onSubmit={methods.handleSubmit(onSubmit)}
      error={apiError}
    >
      <FormField name="name" label="Nama Lengkap" placeholder="John Doe" />
      <FormField
        name="email"
        label="Email"
        type="email"
        placeholder="john@example.com"
      />
      <FormField
        name="password"
        label="Password"
        type="password"
        description="Minimal 6 karakter"
      />
      <FormField
        name="confirmPassword"
        label="Konfirmasi Password"
        type="password"
      />
      <SubmitButton loading={isLoading} fullWidth>
        Daftar
      </SubmitButton>
    </FormWrapper>
  );
}
```

### Profile Update Form

```tsx
export default function ProfileForm() {
  return (
    <FormWrapper methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
      <FormField name="name" label="Nama" placeholder="John Doe" />
      <FormField
        name="email"
        label="Email"
        type="email"
        disabled // Can't change email
      />
      <TextareaField
        name="bio"
        label="Bio"
        placeholder="Ceritakan tentang diri Anda..."
        rows={4}
        description="Max 500 karakter"
      />
      <SubmitButton loading={isLoading}>Simpan Perubahan</SubmitButton>
    </FormWrapper>
  );
}
```

---

## 🔧 Zod Validators

### Defined Validators

Available in `src/lib/validators.ts`:

```typescript
// Authentication
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

// Profile
export const updateProfileSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
  confirmPassword: z.string(),
}).refine(...);
```

### Custom Validator

```typescript
import * as z from "zod";

export const customSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(100, "Judul maksimal 100 karakter"),

  price: z
    .number()
    .min(0, "Harga tidak boleh negatif")
    .max(10000000, "Harga terlalu tinggi"),

  category: z.enum(["Web", "Mobile", "Data"], {
    message: "Kategori tidak valid",
  }),
});

export type CustomInput = z.infer<typeof customSchema>;
```

---

## ⚡ Benefits

### Before (Traditional Approach)

```tsx
// 100+ lines of code
export default function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [apiError, setApiError] = useState("");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">{apiError}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}
```

### After (With Reusable Components)

```tsx
// 30 lines of code - 70% reduction!
export default function Form() {
  const methods = useForm({ resolver: zodResolver(schema) });
  const [apiError, setApiError] = useState("");

  return (
    <FormWrapper
      methods={methods}
      onSubmit={methods.handleSubmit(onSubmit)}
      error={apiError}
    >
      <FormField name="email" label="Email" type="email" />
      <FormField name="password" label="Password" type="password" />
      <SubmitButton loading={isLoading} fullWidth>
        Submit
      </SubmitButton>
    </FormWrapper>
  );
}
```

### Improvements

✅ **70% less code** per form  
✅ **Zero duplicate error handling**  
✅ **Automatic validation** with Zod  
✅ **Consistent styling** across all forms  
✅ **Type-safe** with TypeScript  
✅ **Built-in loading states**  
✅ **Maintainable** - change once, apply everywhere

---

## 🎨 Customization

### Custom Styling

```tsx
<FormField name="email" label="Email" className="border-2 border-orange-500" />
```

### Custom Loading Text

```tsx
<SubmitButton loading={isLoading} loadingText="Menyimpan data...">
  Simpan
</SubmitButton>
```

### Custom Button Variant

```tsx
<SubmitButton loading={isLoading} variant="outline" size="lg">
  Submit
</SubmitButton>
```

---

## 🐛 Common Issues

### Error: "Cannot read property 'register' of undefined"

**Solution:** Make sure component is wrapped in `FormWrapper` which provides `FormProvider`.

```tsx
// ❌ Bad
<FormField name="email" label="Email" />

// ✅ Good
<FormWrapper methods={methods} onSubmit={...}>
  <FormField name="email" label="Email" />
</FormWrapper>
```

### Error: Field name doesn't match schema

**Solution:** Ensure field `name` prop matches Zod schema key exactly.

```tsx
// Schema
const schema = z.object({
  emailAddress: z.string().email(), // key is "emailAddress"
});

// ❌ Bad
<FormField name="email" ... />

// ✅ Good
<FormField name="emailAddress" ... />
```

### Validation not working

**Solution:** Add `zodResolver` to `useForm`.

```tsx
// ❌ Bad
const methods = useForm();

// ✅ Good
const methods = useForm({
  resolver: zodResolver(mySchema),
});
```

---

## 4️⃣ NumberInput

Number input dengan thousand separator formatting (Rp 1.000.000) tetapi value clean (1000000)

### Features

- ✅ Display with separator (e.g., "Rp 1.000.000")
- ✅ Store clean value internally (e.g., 1000000)
- ✅ Customizable prefix, separator, decimals
- ✅ Auto-format on blur, show raw on focus
- ✅ Full React Hook Form integration

### Basic Usage

```tsx
import { NumberInput } from "@/components/common";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function MyForm() {
  const methods = useForm({
    resolver: zodResolver(mySchema),
    defaultValues: {
      price: 0,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <NumberInput
          name="price"
          label="Harga"
          prefix="Rp "
          thousandSeparator="."
          decimalSeparator=","
          decimals={0}
          placeholder="0"
          description="Masukkan harga dalam rupiah"
        />
      </form>
    </FormProvider>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Field name (required) |
| `label` | `string` | - | Field label (required) |
| `prefix` | `string` | `""` | Prefix (e.g., "Rp ") |
| `thousandSeparator` | `string` | `"."` | Thousand separator (e.g., ".", ",") |
| `decimalSeparator` | `string` | `","` | Decimal separator |
| `decimals` | `number` | `0` | Number of decimal places |
| `placeholder` | `string` | `"0"` | Placeholder text |
| `description` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disable field |
| `required` | `boolean` | `false` | Show required indicator |
| `onValueChange` | `function` | - | Callback when value changes |

### Advanced Examples

#### With Decimal Places

```tsx
<NumberInput
  name="discount"
  label="Diskon"
  prefix="Rp "
  thousandSeparator="."
  decimalSeparator=","
  decimals={2}
  description="Diskon dalam rupiah"
/>
```

#### Without Prefix

```tsx
<NumberInput
  name="quantity"
  label="Jumlah"
  thousandSeparator=","
  decimalSeparator="."
  decimals={0}
  description="Jumlah item"
/>
```

#### With Value Change Callback

```tsx
<NumberInput
  name="price"
  label="Harga"
  prefix="Rp "
  thousandSeparator="."
  decimalSeparator=","
  decimals={0}
  onValueChange={(cleanValue) => {
    console.log("Clean value:", cleanValue); // 1000000
  }}
/>
```

### Form Value

Ketika form di-submit, value yang dikirim adalah **clean number** (bukan formatted):

```tsx
const onSubmit = (data: any) => {
  console.log(data.price); // 1000000 (bukan "Rp 1.000.000")
};
```

### Behavior

1. **On Focus** - Menampilkan raw number (e.g., "1000000")
2. **On Blur** - Auto-format dengan separator (e.g., "Rp 1.000.000")
3. **On Change** - Value form selalu clean number

### Common Patterns

#### Indonesian Currency (Rupiah)

```tsx
<NumberInput
  name="price"
  label="Harga"
  prefix="Rp "
  thousandSeparator="."
  decimalSeparator=","
  decimals={0}
/>
```

#### International Currency (US Dollar)

```tsx
<NumberInput
  name="price"
  label="Price"
  prefix="$ "
  thousandSeparator=","
  decimalSeparator="."
  decimals={2}
/>
```

---

## 📚 Related Documentation

- [Frontend Architecture Guide](./FRONTEND_ARCHITECTURE.md)
- [Copilot Instructions](../.github/copilot-instructions.md)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

---

**Happy Coding! 🚀**
