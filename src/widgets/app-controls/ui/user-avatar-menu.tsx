import { useAuth } from "@/features/auth/model/auth-context";
import { useAuthDialog } from "@/features/auth/model/use-auth-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { LogOut, User } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useSignOut } from "@/features/auth/api/auth.mutations";
import { useNetworkStatus } from "@/shared/lib/use-network-status";

export default function UserAvatarMenu() {
  const { handleOpen } = useAuthDialog();
  const { status, session } = useAuth();
  const { isOnline } = useNetworkStatus({});
  const { mutateAsync, isPending } = useSignOut(() => isOnline);

  if (status === "initializing") {
    return <Skeleton className="size-10 rounded-full" />;
  }

  if (status === "unauthenticated") {
    return (
      <Avatar size="default" onClick={handleOpen}>
        <AvatarImage src={undefined} />
        <AvatarFallback>
          <User className="size-5" />
        </AvatarFallback>
      </Avatar>
    );
  }

  if (status === "authenticated" || status === "authenticated-offline") {
    const name = session?.user.user_metadata?.fullName;
    const fallback = name?.trim().charAt(0).toUpperCase() || "?";

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Avatar size="default">
            <AvatarImage
              src={session?.user.user_metadata?.avatar_url ?? undefined}
            />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="right"
          sideOffset={25}
          className="w-64"
        >
          <div className="space-y-1">
            <p className="font-medium">{name || "User"}</p>

            <p className="text-sm text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => mutateAsync()}
            disabled={isPending}
          >
            {!isPending ? (
              <div className="flex items-center gap-2">
                <LogOut />
                <p>logout</p>
              </div>
            ) : (
              "logging out ..."
            )}
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return null;
}
