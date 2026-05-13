import type { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { APP_PATHS } from "@/constants/app-paths";
import { Link } from "react-router-dom";

type InfoPageLayoutProps = {
  title: string;
  breadcrumbPage: string;
  children: ReactNode;
};

export function InfoPageLayout({
  title,
  breadcrumbPage,
  children,
}: InfoPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="container-custom !py-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={APP_PATHS.home}>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumbPage}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="container-custom">
        <article className="max-w-2xl pt-8 pb-16 sm:pt-10 sm:pb-20 md:pt-12 md:pb-24">
          <div className="h-px w-10 bg-[#FF6600] mb-6" aria-hidden />
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight mb-6">
            {title}
          </h1>
          <div className="space-y-6 text-gray-600 text-[15px] sm:text-base leading-[1.75]">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
