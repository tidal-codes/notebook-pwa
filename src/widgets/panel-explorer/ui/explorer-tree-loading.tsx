import { Skeleton } from "@/shared/ui/skeleton";


export default function ExplorerTreeLoading() {
  return (
    <div className="px-6 py-4">
        {Array.from({"length" : 3}).map((_,i) => (
            <Skeleton key={i} className="w-full h-7 mb-3"/>
        ))}
    </div>
  )
}
