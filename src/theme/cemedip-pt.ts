const textInputBaseClass =
  'w-full h-14 px-5 rounded-xl transition-all border border-surface-200 focus:border-primary';

const passwordToggleIconClass = 'top-1/2 -translate-y-1/2 right-4 text-surface-400 cursor-pointer';

export const CemedipPT = {
  inputtext: {
    root: {
      class: textInputBaseClass,
    },
  },
  password: {
    pcInputText: {
      root: {
        class: textInputBaseClass,
      },
    },
    maskIcon: {
      class: passwordToggleIconClass,
    },
    unmaskIcon: {
      class: passwordToggleIconClass,
    },
  },
  select: {
    root: {
      class: 'rounded-xl shadow-none transition-colors border border-surface-200',
    },
    label: {
      class: 'flex items-center text-base font-medium text-surface-600',
    },
    dropdownIcon: {
      class: 'text-surface-500',
    },
    listContainer: {
      class: 'rounded-2xl',
    },
    option: {
      class: 'px-5 py-3.5',
    },
    optionLabel: {
      class: 'text-base font-medium text-surface-700',
    },
    emptyMessage: {
      class: 'px-4 py-3 text-base text-surface-500',
    },
  },
  button: {
    root: {
      class: 'transition-all rounded-lg',
    },
    label: {
      class: 'px-2',
    },
  },
  paginator: {
    first: { class: 'w-9 h-9 bg-surface-200 text-surface-700 rounded-lg' },
    prev:  { class: 'w-9 h-9 bg-surface-200 text-surface-700 rounded-lg' },
    next:  { class: 'w-9 h-9 bg-surface-200 text-surface-700 rounded-lg' },
    last:  { class: 'w-9 h-9 bg-surface-200 text-surface-700 rounded-lg' },
    page:  { class: 'w-9 h-9 bg-surface-200 text-surface-700 rounded-lg' },
  },
};

export default CemedipPT;
