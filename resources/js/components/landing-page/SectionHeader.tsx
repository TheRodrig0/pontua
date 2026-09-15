import React from 'react';

export interface SectionHeaderProps {
    tag: string;
    title: string;
    tagColor?: 'teal' | 'coral';
    titleColor?: string;
    className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    tag,
    title,
    tagColor = 'teal',
    titleColor = 'text-app-navy dark:text-white',
    className = '',
}) => {
    const isCoral = tagColor === 'coral';
    const barBgClass = isCoral ? 'bg-app-coral' : 'bg-app-teal';
    const tagTextClass = isCoral ? 'text-app-coral' : 'text-app-teal';

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center gap-2.5">
                <span className={`w-8 h-0.5 ${barBgClass}`} />
                <span className={`text-xs font-bold tracking-wider uppercase ${tagTextClass}`}>
                    {tag}
                </span>
            </div>

            <h2 className={`text-2xl sm:text-4xl font-extrabold leading-tight ${titleColor}`}>
                {title}
            </h2>
        </div>
    );
};

export default SectionHeader;
