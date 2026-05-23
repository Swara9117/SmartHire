import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './Common/NotificationBell';

const candidateNav = [
  { name: 'Home', href: '/' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'AI Recommendations', href: '/job-recommendations' },
  { name: 'My Applications', href: '/my-applications' },
  { name: 'Resume Analyzer', href: '/resume-analyzer' },
  { name: 'Interview Simulator', href: '/technical-interview' },
  { name: 'HR Round', href: '/hr-interview' },
  { name: 'Leaderboard', href: '/leaderboards' },
];

const recruiterNav = [
  { name: 'Dashboard', href: '/recruiter/dashboard' },
  { name: 'Post Job', href: '/recruiter/post-job' },
];

const adminNav = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Manage Users', href: '/admin/users' },
];

const guestNav = [
  { name: 'Home', href: '/' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Resume Analyzer', href: '/resume-analyzer' },
  { name: 'Interview Simulator', href: '/technical-interview' },
  { name: 'Leaderboard', href: '/leaderboards' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { isLoggedIn, setIsLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const navigation =
    user?.role === 'Recruiter'
      ? recruiterNav
      : user?.role === 'Admin'
        ? adminNav
        : isLoggedIn
          ? candidateNav
          : guestNav;

  return (
    <Disclosure as="nav" className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
              <Bars3Icon className="block size-6 group-data-[open]:hidden" />
              <XMarkIcon className="hidden size-6 group-data-[open]:block" />
            </DisclosureButton>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex items-center">
              <img
                className="h-10 w-10 object-cover rounded-full ring-2 ring-indigo-500 shadow-md"
                src={logo}
                alt="SmartHire Logo"
              />
              <span className="ml-2 text-white text-lg font-semibold hidden sm:block">
                SmartHire
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4 overflow-x-auto">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-4">
            <NotificationBell />
            <button
              onClick={() => navigate('/setting')}
              className="relative rounded-full bg-gray-900 p-1 text-gray-400 hover:text-white"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </button>

            {isLoggedIn ? (
              <Menu as="div" className="relative ml-3">
                <MenuButton className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                </MenuButton>
                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                  <MenuItem>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Your Profile
                    </a>
                  </MenuItem>
                  {user?.role === 'Candidate' && (
                    <MenuItem>
                      <a href="/candidate-profile-setup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Resume & Skills
                      </a>
                    </MenuItem>
                  )}
                  <MenuItem>
                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        localStorage.removeItem('isLoggedIn');
                        window.location.href = '/';
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            ) : (
              <button
                onClick={() => navigate('/signin')}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
