import useLoginForm from "../model/use-login-form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/shared/ui/field";
import type { LoginSchema } from "../model/schemas";
import { useSignIn } from "../api/auth.mutations";
import { useNetworkStatusContext } from "@/shared/lib/network-status-provider";


interface Props {
  handleCloseDialog: () => void;
}

export default function LoginForm({ handleCloseDialog }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useLoginForm();

  const { isOnline } = useNetworkStatusContext();

  const { mutateAsync: signIn, isPending } = useSignIn(() => isOnline);

  const onSubmit = async (data: LoginSchema) => {
    if (!isOnline) {
      setError("root", {
        type: "network",
        message:
          "You are offline. Please connect to the internet and try again.",
      });

      return;
    }

    try {
      await signIn(data);
      handleCloseDialog();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.";

      setError("root", {
        type: "server",
        message,
      });
    }
  };

  const isLoading = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      {/* General / server error */}
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

      {/* Password */}
      <Field data-invalid={!!errors.password}>
        <FieldLabel htmlFor="password">Password</FieldLabel>

        <FieldContent>
          <Input
            id="password"
            placeholder="Enter your password"
            autoComplete="off"
            aria-invalid={!!errors.password}
            {...register("password")}
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
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
