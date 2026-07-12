import TabsSection from "./tabs-section";


export default function EditorArea() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-card w-full px-4 py-3">
        <TabsSection/>
      </div>
      <div className="flex-1"></div>
    </div>
  );
}
