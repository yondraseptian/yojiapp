
export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10  items-center justify-center rounded-full p-1.5  bg-sidebar-primary text-sidebar-primary-foreground">
                <img  src="/iconWhite.png" alt="" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">YojiApp</span>
            </div>
        </>
    );
}
