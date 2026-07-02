import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Today', icon: '⌂' },
  { to: '/tasks', label: 'Tasks', icon: '☑' },
  { to: '/money', label: 'Money', icon: '₹' },
  { to: '/train', label: 'Train', icon: '🏋' },
  { to: '/progress', label: 'Progress', icon: '📈' },
];

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface2 safe-bottom z-40">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-xs no-select active:scale-95 ${
                isActive ? 'text-accent' : 'text-muted'
              }`
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="mt-0.5">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}