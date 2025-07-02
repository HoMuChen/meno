import { useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Fragment } from "react/jsx-runtime";

export function DynamicBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Function to format the path segment into a readable title
  const formatPathSegment = (segment: string) => {
    // Handle numeric IDs
    if (/^\d+$/.test(segment)) {
      return segment;
    }
    // Convert kebab-case or snake_case to Title Case
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Function to build the path up to the current segment
  const buildPath = (index: number) => {
    return '/' + pathnames.slice(0, index + 1).join('/');
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathnames.length === 0 ? (
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm md:text-base">Home</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            {/* Mobile: Show only current page */}
            <BreadcrumbItem className="md:hidden">
              <BreadcrumbPage className="text-sm truncate max-w-[200px]">
                {formatPathSegment(pathnames[pathnames.length - 1])}
              </BreadcrumbPage>
            </BreadcrumbItem>
            
            {/* Desktop: Show full breadcrumb */}
            {pathnames.map((segment, index) => {
            const isLast = index === pathnames.length - 1;
            const path = buildPath(index);
            const title = formatPathSegment(segment);

            return (
              <Fragment key={path}>
                  <BreadcrumbItem className="hidden md:block">
                  {isLast ? (
                      <BreadcrumbPage className="text-sm md:text-base">{title}</BreadcrumbPage>
                  ) : (
                      <BreadcrumbLink href={path} className="text-primary hover:text-primary/80 text-sm md:text-base">
                        {title}
                      </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
              </Fragment>
            );
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 
