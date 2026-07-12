import TabItem from "./tab-item";

export default function TabList() {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: 2 }).map((_, i) => (
        // <TabItem key={i} />
        null
      ))}
    </div>
  );
}
