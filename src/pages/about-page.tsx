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

const COVER_SRC = "/cover-photo.png";

const AboutPage = () => {
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
                <BreadcrumbPage>About us</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <figure className="relative w-full overflow-hidden bg-neutral-200">
        <div className="relative w-full min-h-[240px] h-[clamp(240px,45vh,800px)] sm:h-[clamp(260px,48vh,820px)] lg:h-[clamp(280px,52vh,860px)]">
          <img
            src={COVER_SRC}
            alt="Aurevo flagship space and curated sneaker selection"
            className="absolute inset-0 h-full w-full object-cover object-left-bottom"
            width={1920}
            height={640}
            sizes="100vw"
            loading="eager"
            decoding="async"
          />
        </div>
      </figure>

      <div className="container-custom">
        <article className="max-w-2xl pt-8 pb-16 sm:pt-10 sm:pb-20 md:pt-12 md:pb-24">
          <div className="h-px w-10 bg-[#FF6600] mb-6" aria-hidden />
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight mb-6">
            Aurevo Fashion
          </h1>
          <div className="space-y-6 text-gray-600 text-[15px] sm:text-base leading-[1.75]">
            <p>
              Aurevo began in Bangladesh—from the pulse of our cities to the
              quiet confidence of a pair that carries you through long days and
              big moments. We started with a belief that sneaker culture here
              deserves the same integrity, depth, and respect you would expect
              anywhere in the world.
            </p>
            <p>
              Our stores are where that belief becomes real. We listen to
              runners, commuters, collectors, and first-time buyers, then curate
              silhouettes that earn their place on the shelf: footwear that
              stands up to real weather, real commutes, and the rhythm of life
              as you actually live it.
            </p>
            <p>
              We are a Bangladeshi brand holding ourselves to a global standard
              without forgetting the communities that raised us. Every
              conversation at the counter, every box we hand over, is part of
              the same story—one we are proud to keep writing with everyone who
              walks through our doors.
            </p>
          </div>
          <p className="mt-10">
            <Link
              to={APP_PATHS.products}
              className="text-sm font-medium text-gray-900 border-b border-gray-900 pb-0.5 hover:text-[#FF6600] hover:border-[#FF6600] transition-colors"
            >
              View collection
            </Link>
          </p>
        </article>
      </div>
    </div>
  );
};

export default AboutPage;
