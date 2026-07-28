interface Props {
  noteTitle: string | undefined;
}
export default function TabControllerSectionTitle({ noteTitle }: Props) {
  return (
    <p className="text-xs text-muted-foreground">{noteTitle || "new tab"}</p>
  );
}
