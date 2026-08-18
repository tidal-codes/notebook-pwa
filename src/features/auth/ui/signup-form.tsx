import { Button } from "@/shared/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

import useSignupForm from "../model/use-signup-form";
import type { SignUpSchema } from "../model/schemas";
import { useSignUp } from "../api/auth.mutations";
import { useNetworkStatus } from "@/shared/lib/use-network-status";

interface Props {
  handleCloseDialog: () => void;
}

export default function SignupForm({ handleCloseDialog }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useSignupForm();

  const { isOnline } = useNetworkStatus({});

  const { mutateAsync: signUp, isPending } = useSignUp(() => isOnline);

  const onSubmit = async (data: SignUpSchema) => {
    if (!isOnline) {
      setError("root", {
        type: "network",
        message:
          "You are offline. Please connect to the internet and try again.",
      });

      return;
    }

    try {
      await signUp(data);
      handleCloseDialog();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account.";

      setError("root", {
        type: "server",
        message,
      });
    }
  };

  const isLoading = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      {/* Server / general form error */}
      {errors.root?.message && <FieldError>{errors.root.message}</FieldError>}

      {/* Email */}
      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email">Email</FieldLabel>

        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FieldContent>

        {errors.email?.message && (
          <FieldError>{errors.email.message}</FieldError>
        )}
      </Field>

      {/* Full name */}
      <Field data-invalid={!!errors.fullName}>
        <FieldLabel htmlFor="fullName">Full Name</FieldLabel>

        <FieldContent>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
        </FieldContent>

        {errors.fullName?.message && (
          <FieldError>{errors.fullName.message}</FieldError>
        )}
      </Field>

      {/* Password */}
      <Field data-invalid={!!errors.password}>
        <FieldLabel htmlFor="password">Password</FieldLabel>

        <FieldContent>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FieldContent>

        {errors.password?.message && (
          <FieldError>{errors.password.message}</FieldError>
        )}
      </Field>

      <Field data-invalid={!!errors.confirmPassword}>
        <FieldLabel htmlFor="password">confirm password</FieldLabel>

        <FieldContent>
          <Input
            id="confirm-password"
            type="password"
            placeholder="confirm your password"
            autoComplete="off"
            aria-invalid={!!errors.password}
            {...register("confirmPassword")}
          />
        </FieldContent>

        {errors.password?.message && (
          <FieldError>{errors.password.message}</FieldError>
        )}
      </Field>

      <Button
        type="submit"
        className="mt-4 w-full"
        disabled={isLoading || !isOnline}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
