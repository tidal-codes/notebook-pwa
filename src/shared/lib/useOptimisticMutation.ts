import { useMutation, useQueryClient, type MutationFunction } from "@tanstack/react-query";

interface UseOptimisticMutationOptions<TMutateFnData, TData, TVariables> {
    mutationKey: readonly unknown[];
    queryKey: readonly unknown[];
    mutationFn: MutationFunction<TMutateFnData, TVariables>;
    optimisticUpdater?: (variables: TVariables, oldData: TData) => TData;
    onSuccessUpdater?: (data: TMutateFnData, variables: TVariables, oldData: TData | undefined) => TData;
    onSettledInvalidate?: boolean;
    onError?: () => void;
    onSuccess?: () => void;
}

export function useOptimisticMutation<TMutateFnData, TData, TVariables = unknown>({
    mutationKey,
    queryKey,
    mutationFn,
    optimisticUpdater,
    onSuccessUpdater,
    onSettledInvalidate = true,
    onError,
    onSuccess,
}: UseOptimisticMutationOptions<TMutateFnData, TData, TVariables>) {
    const queryClient = useQueryClient();

    return useMutation<TMutateFnData, Error, TVariables, { previousData: TData | undefined }>({
        mutationKey,
        mutationFn,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData<TData>(queryKey);

            if (previousData && optimisticUpdater) {
                queryClient.setQueryData<TData>(queryKey, (old) => {
                    if (!old) return previousData;
                    return optimisticUpdater(variables, old);
                });
            }
            return { previousData };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
            onError?.();
        },
        onSuccess: (data, variables) => {
            if (onSuccessUpdater) {
                queryClient.setQueryData<TData>(queryKey, (old) => {
                    return onSuccessUpdater(data, variables, old);
                });
            }
            onSuccess?.();
        },
        onSettled: () => {
            if (onSettledInvalidate) {
                queryClient.invalidateQueries({ queryKey });
            }
        },
    });
}