import { useMutation } from "@tanstack/react-query";
import { healthCheck } from ".";

export function useHealthCheck() {
  return useMutation({
    mutationFn: () => healthCheck(),
  });
}
