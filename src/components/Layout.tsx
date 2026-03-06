import { ReactNode } from "react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="page-container">
    <TopBar />
    <main className="max-w-lg mx-auto">{children}</main>
    <BottomNav />
  </div>
);

export default Layout;
