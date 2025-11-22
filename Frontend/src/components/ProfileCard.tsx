export default function ProfileCard({profileImg, profileLink, profileName}: {profileImg: string, profileLink: string, profileName: string}) {
  return (
    <div className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-lg shadow-xs hover:scale-103 transition-transform">
        <a href={profileLink}>
            <img className="rounded-lg" src={profileImg} alt="profile-picture" />
        </a>
        <a href={profileLink}>
        <h1 className="mt-6 mb-2 text-2xl font-semibold tracking-tight text-heading">
            {profileName}
        </h1>
        </a>
        <a href={profileLink} className="inline-flex items-center hover:bg-muted text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-lg text-sm px-4 py-2.5 focus:outline-none">
            Visit Profile
            <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
        </a>
    </div>
  )
}
