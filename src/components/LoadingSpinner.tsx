import { colours } from '@/styles/colours';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function LoadingAnimation({ size = 'large', className }: LoadingAnimationProps) {
  const sizeClasses = {
    small: {
      container: 'w-24 h-24',
      spinner: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    medium: {
      container: 'w-32 h-32',
      spinner: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-base'
    },
    large: {
      container: 'w-48 h-48',
      spinner: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-lg'
    }
  };

  const classes = sizeClasses[size];
  
  return (
    <div className={`flex flex-col items-center ${size === 'large' ? 'justify-start pt-20 min-h-screen' : 'justify-center'} p-4 ${className || ''}`} style={{ backgroundColor: size === 'large' ? colours.background.secondary : 'transparent' }}>
      <div className="flex flex-col items-center">
        <div className={`relative ${classes.container} mb-4 flex flex-col items-center justify-center`}>
          {/* Circle background to create hole effect */}
          <div
            className={`absolute inset-0 ${classes.container} rounded-full`}
            style={{ 
              backgroundColor: colours.background.primary,
              boxShadow: size === 'small' ? 'none' : 'inset 0 8px 20px rgba(0, 0, 0, 0.3), inset 0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          />
          <div className={`relative ${classes.spinner} flex items-center justify-center z-10 mb-4`}>
          <div className="absolute inset-0 w-full h-full border-4 rounded-full animate-spin" style={{ borderColor: colours.spinner.border, borderTopColor: colours.spinner.borderTop }} />
          <span className="relative flex items-center justify-center" style={{ top: '-2px',  left: '-2px', position: 'relative' }}>
            {/* Inline SVG for shopping cart */}
            <svg
              viewBox="0 0 960 960"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={classes.icon}
              style={{ color: colours.spinner.trolley }}
            >
              <path
                d="M624.301 794.678C573.128 794.678 521.701 794.678 469.468 794.678C486.276 843.947 458.564 899.225 409.086 915.162C311.334 945.578 249.953 807.904 339.653 754.655C314.472 728.485 309.199 694.824 302.883 661.947C276.05 547.79 270.881 425.922 227.984 316.652C209.946 284.14 170 296.633 139.575 296.657C124.513 299.424 108.45 291.46 106.479 277.124C101.827 249.637 137.976 245.048 158.473 243.285C243.122 231.781 283.315 278.68 299.406 356.443C441.887 350.945 583.094 343.934 725.414 339.555C750.554 338.787 775.845 338.25 800.602 344.503C881.388 364.387 849.484 460.513 837.97 518.699C831.029 551.094 821.399 582.621 805.611 611.992C768.606 691.421 690.009 702.546 610.74 698.849C529.938 699.364 449.237 697.643 368.437 696.267C374.41 728.491 417.156 734.857 444.105 738.069C542.04 746.714 639.879 737.755 737.721 732.628C787.577 737.281 805.288 800.704 791.412 841.849C755.975 954.732 597.452 911.191 624.301 794.678ZM632.991 394.093C574.412 396.925 517.582 399.672 459.464 402.482C464.6 431.473 469.513 459.208 474.443 487.039C524.368 487.039 573.453 487.039 623.105 487.039C626.399 456.073 629.642 425.58 632.991 394.093ZM498.906 646.896C535.731 646.896 571.938 646.896 608.016 646.896C610.968 611.611 613.865 576.993 616.814 541.739C572.061 541.739 528.263 541.739 483.482 541.739C488.675 577.139 493.761 611.813 498.906 646.896ZM793.184 489.176C796.57 466.402 800.772 443.577 803.12 420.562C804.874 403.366 798.616 395.553 781.514 393.881C749.944 391.311 716.905 389.708 685.507 392.613C681.99 425.147 678.571 456.768 675.067 489.175C714.215 489.176 752.731 489.176 793.184 489.176ZM336.214 546.362C339.729 577.728 348.366 608.768 354.103 639.987C354.545 642.064 358.59 644.729 361.039 644.815C390.684 645.849 417.934 645.186 448.003 647.535C442.124 611.54 436.439 576.738 430.592 540.943C398.463 542.787 367.534 544.563 336.214 546.362ZM657.501 647.049C722.773 655.527 763.64 601.173 779.129 543.979C741.657 543.979 705.436 543.979 668.455 543.979C664.801 578.363 661.199 612.251 657.501 647.049ZM420.79 487.225C416.602 474.969 410.564 402.614 401.301 404.642C371.292 406.176 341.52 405.673 311.778 410.877C316.677 438.863 321.386 465.762 326.162 493.046C357.801 491.1 388.709 489.199 420.79 487.225ZM420.96 825.072C421.924 803.696 397.069 782.271 379.428 791.448C357.712 801.802 338.474 824.385 354.746 848.906C374.928 884.023 421.378 860.498 420.96 825.072ZM727.16 787.135C719.684 787.717 713.283 788.441 706.866 788.673C655.858 789.134 666.931 866.618 714.877 855.2C738.994 847.289 751.222 818.568 740.323 795.676C737.406 789.549 733.668 785.274 727.16 787.135Z"
                fill="currentColor"
              />
            </svg>
          </span>
          </div>
          <div className={`relative ${classes.text} font-semibold tracking-wide z-10`} style={{ color: colours.text.secondary }}>
            Loading...
          </div>
        </div>
      </div>
    </div>
  );
}