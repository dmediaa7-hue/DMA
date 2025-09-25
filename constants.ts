
import { PageContent, SiteSettings, Member, Candidate, GalleryImage, Announcement } from './types';

export const INITIAL_CONTENT: PageContent = {
    home: {
        title: 'Shaping the Future of Digital Media',
        subtitle: 'The Digital Media Association is the leading professional organization dedicated to advancing the field of digital media through innovation, education, and collaboration.',
        contentHtml: '',
        imageUrl: 'https://picsum.photos/1200/600',
    },
    about: {
        title: 'About The Digital Media Association',
        contentHtml: '<p>Founded in 2010, the Digital Media Association (DMA) has been at the forefront of the digital revolution. We are a non-profit organization committed to fostering a vibrant community of professionals, educators, and students in the ever-evolving world of digital media.</p><p>Our members represent a diverse range of disciplines, including web design, digital marketing, content creation, virtual reality, and interactive technology. We provide a platform for knowledge sharing, professional development, and networking to help our members excel in their careers.</p>',
        imageUrl: 'https://picsum.photos/800/600',
        features: [
            { title: 'Our Mission', description: '<p>To empower digital media professionals with the resources, knowledge, and connections they need to succeed and innovate.</p>', icon: 'mission', imageUrl: 'https://picsum.photos/400/300?random=10' },
            { title: 'Our Vision', description: '<p>To be the global leader in shaping the future of digital media, setting standards for excellence and ethical practice.</p>', icon: 'vision', imageUrl: 'https://picsum.photos/400/300?random=11' },
            { title: 'Our Values', description: '<p>We believe in collaboration, continuous learning, integrity, and pushing the boundaries of creativity and technology.</p>', icon: 'values', imageUrl: 'https://picsum.photos/400/300?random=12' }
        ]
    },
    services: {
        title: 'Services & Programs',
        subtitle: 'We offer a wide range of programs and services designed to support our members at every stage of their careers.',
        contentHtml: '',
        features: [
            { title: 'Workshops & Training', description: 'Hands-on workshops on the latest tools and technologies in digital media.', icon: 'workshop', imageUrl: 'https://picsum.photos/seed/dma-ws/400/300' },
            { title: 'Networking Events', description: 'Connect with industry leaders, peers, and potential employers at our exclusive events.', icon: 'networking', imageUrl: 'https://picsum.photos/seed/dma-net/400/300' },
            { title: 'Career Center', description: 'Access to job boards, resume reviews, and career coaching services.', icon: 'career', imageUrl: 'https://picsum.photos/seed/dma-car/400/300' },
            { title: 'Certification Programs', description: 'Earn industry-recognized certifications to validate your skills and expertise.', icon: 'certification', imageUrl: 'https://picsum.photos/seed/dma-cert/400/300' },
            { title: 'Annual Conference', description: 'Our flagship event featuring keynote speakers, panel discussions, and technology showcases.', icon: 'conference', imageUrl: 'https://picsum.photos/seed/dma-conf/400/300' },
            { title: 'Mentorship Program', description: 'Pairing experienced professionals with emerging talent for guidance and support.', icon: 'mentorship', imageUrl: 'https://picsum.photos/seed/dma-ment/400/300' },
        ]
    },
     membership: {
        title: 'Unlock Your Potential',
        subtitle: 'Join a thriving community of digital media innovators. DMA membership provides you with the tools and connections to elevate your career.',
        contentHtml: '',
        features: [
            { title: 'Exclusive Content', description: 'Access to our library of research papers, webinars, and case studies.', icon: 'content' },
            { title: 'Member Directory', description: 'Connect with thousands of professionals worldwide through our private directory.', icon: 'directory' },
            { title: 'Event Discounts', description: 'Receive significant discounts on all DMA workshops, conferences, and events.', icon: 'discount' },
            { title: 'Voting Rights', description: 'Participate in association elections and have a say in our future direction.', icon: 'voting' },
            { title: 'Digital Membership Card', description: 'A verifiable digital card to showcase your professional affiliation.', icon: 'card' },
            { title: 'Leadership Opportunities', description: 'Volunteer for committees and help shape the future of the DMA.', icon: 'leadership' },
        ]
    },
    election: {
        title: 'Association Election',
        subtitle: 'Your vote shapes our future. Please review the candidates and cast your vote.',
        contentHtml: '',
    },
    gallery: {
        title: 'Gallery',
        subtitle: 'A glimpse into our events, workshops, and community.',
        contentHtml: '',
        bannerUrl: 'https://picsum.photos/seed/dma-banner/820/312',
    },
    contact: {
        title: 'Get In Touch',
        subtitle: "We'd love to hear from you. Reach out with any questions or comments.",
        contentHtml: '',
    }
};

export const INITIAL_SETTINGS: SiteSettings = {
    siteName: 'Digital Media Association',
    logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZhtPSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWRpYicePjxwYXRoIGQ9Ik00IDdoNWwxMS41IDExLjVMMjAgMTdsLTcuNS03LjVaIi8+PHBhdGggZD0iTTE4IDZjLTEuNjYgMC0zIDEuMzQtMyAzIi8+PC9zdmc+',
    faviconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZhtPSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWRpY2UiPjxwYXRoIGQ9Ik00IDdoNWwxMS41IDExLjVMMjAgMTdsLTcuNS03LjVaIi8+PHBhdGggZD0iTTE4IDZjLTEuNjYgMC0zIDEuMzQtMyAzIi8+PC9zdmc+',
    contact: {
        address: '123 Digital Avenue, Tech City, 10101',
        phone: '(555) 123-4567',
        email: 'contact@dma.org'
    },
    socialLinks: {
        facebook: '#',
        twitter: '#',
        linkedin: '#'
    },
    membershipFee: 150,
    maintenanceMode: false,
    colors: {
        primary: '#8B5CF6',
        primaryDark: '#7C3AED',
        secondary: '#10B981',
        lightBg: '#F3F4F6',
        darkBg: '#1F2937',
        darkCard: '#374151',
    },
    font: {
        family: 'Inter',
    },
    districts: [
        'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur',
        'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong',
        'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas',
        'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman',
        'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
    ],
};

export const INITIAL_MEMBERS: Member[] = [
    { ID: 'admin', Name: 'Admin User', House: 'System', Email: 'contact@dma.org', Password: 'Admin@02223', membershipDate: new Date().toISOString(), Status: 'Active', hasVoted: false },
    { ID: 'mem1', Name: 'Alice Johnson', House: 'Gryffindor', Email: 'alice@example.com', Password: 'password123', membershipDate: '2023-01-15', Status: 'Active', hasVoted: false },
    { ID: 'mem2', Name: 'Bob Williams', House: 'Hufflepuff', Email: 'bob@example.com', Password: 'password123', membershipDate: '2023-03-22', Status: 'Active', hasVoted: true },
    { ID: 'mem3', Name: 'Charlie Brown', House: 'Ravenclaw', Email: 'charlie@example.com', Password: 'password123', membershipDate: '2023-05-10', Status: 'Pending', hasVoted: false },
];

export const INITIAL_CANDIDATES: Candidate[] = [
    { id: 'can1', name: 'Diana Prince', position: 'President', photoUrl: 'https://i.pravatar.cc/150?u=diana', votes: 120 },
    { id: 'can2', name: 'Bruce Wayne', position: 'President', photoUrl: 'https://i.pravatar.cc/150?u=bruce', votes: 95 },
    { id: 'can3', name: 'Clark Kent', position: 'Vice President', photoUrl: 'https://i.pravatar.cc/150?u=clark', votes: 150 },
];

export const INITIAL_GALLERY: GalleryImage[] = [
    { id: 'gal1', url: 'https://picsum.photos/600/400?random=1', caption: '2023 Annual Conference Keynote', district: 'Kolkata' },
    { id: 'gal2', url: 'https://picsum.photos/600/400?random=2', caption: 'Networking Event Mixer', district: 'Howrah' },
    { id: 'gal3', url: 'https://picsum.photos/600/400?random=3', caption: 'Digital Art Workshop', district: 'North 24 Parganas' },
    { id: 'gal4', url: 'https://picsum.photos/600/400?random=4', caption: 'VR Technology Showcase', district: 'Kolkata' },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann1', title: '2024 Election Period Now Open', content: 'Casting your vote is now available on the election page. Make your voice heard!', date: new Date().toISOString() },
    { id: 'ann2', title: 'Upcoming Workshop: Advanced SEO', content: 'Join us next month for an in-depth workshop on advanced SEO strategies.', date: new Date(Date.now() - 86400000 * 5).toISOString() },
];
