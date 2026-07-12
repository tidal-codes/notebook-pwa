import EditorTabs from "@/widgets/editor-tabs/ui";


export default function EditorArea() {
  return (
    <div className="w-full h-full flex flex-col">
        <div className="bg-card w-full px-4 py-3">
            <EditorTabs/>
        </div>
        <div className="flex-1">

        </div>
    </div>
  )
}
