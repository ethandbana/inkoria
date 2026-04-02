import { ReactNode } from "react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="page-container">
    <TopBar />
    <main className="max-w-4xl mx-auto">{children}</main>
    <BottomNav />
  </div>
);

export default Layout;
