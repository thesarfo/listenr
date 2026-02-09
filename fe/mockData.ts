
import { Album, Review } from './types';

export const MOCK_ALBUMS: Album[] = [
  {
    id: '1',
    title: 'Currents',
    artist: 'Tame Impala',
    year: 2015,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQaU-iSDMJn7SCflZvUgbfkhRnvl41xmxOFn6icv69J_HDXld-w_6jCYDOXVxjqqOiugOu6zEU7VImOpCVzpugutuO3eYPY6EElmttMuHhNy4CPmYorgT73j6Vp-5mDdoT2tRQ7hx0v1vI8OjsD3I_JuP05hB9au8oFfSunn6oXU050Cv2nVjV_ool3txhIujKlHWPw0OIHhqffC0chEA2HFjyOcf-VxFYlJye0HLlpPoX1xsn8RSrSzn0Oa30j2czaf3uKK-DHy8',
    genre: ['Psychedelic Pop', 'Electronic'],
    rating: 4.5
  },
  {
    id: '2',
    title: 'To Pimp A Butterfly',
    artist: 'Kendrick Lamar',
    year: 2015,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA4C2AHDnX5Yk3wMbXVP9UuPHklLKDuiOaIprlhJpwdAseueeO2QqIm9PdJi0mJSzoV7wjSTBWAsSV-TfGI3kGWGEikkx15--GWIVvosWMW0928u4trdFLLwzgAaevcxd03MWL4ARtiAmrPzZoaB_-ENUAJHtSJqBOegMtvUee5llk3n4NpY6Z-CXSNXTvRBqn1AJUXx4a0Smp-CJQofV6U6mf0gZJkZ_oCXCagZ-asg2BD2XFlN7xgbCBaGcG3lxkqAiBXU8W_Rc',
    genre: ['Conscious Hip Hop', 'Jazz Rap', 'Funk'],
    rating: 5.0
  },
  {
    id: '3',
    title: 'The New Abnormal',
    artist: 'The Strokes',
    year: 2020,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2Uvj07uHUoOYryLc83jWS5B5Kg1WC13gmNKDFm-ZAuMXXW8IqNsdXG3gqYDhj0NGKyDH-fb8CH5dXbnsWE431BX40WFM1Hzhku0Ye0dWDon-xskmpS7D_CZjZhUyu7LAw42FyYkXpurf5cT5YyXVQW1AYHyY3XXSSXPEmZLgibQR9lddI82DtIXjgTbRv-un39Xs1YqUxnJUbeUA8NJwe_7FviGrh75sjs2RLGnhIropVjnsq7LsERH62adLHPmgIuZjrMOTYeCI',
    genre: ['Indie Rock'],
    rating: 4.5
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    userName: 'Alex Rivera',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkhWfPlTdXZ8ScjL1ACgSjzUN1Rih8Tt5bO2aVHFgsOIx1r12SMDjpUekw7tRpHa91m5APTpTu90G432EXlnMp3kkaZVvcnzkKQFEm2y3fYpV2Ehs7ZR7YPKwmbc7_U51ilwUwTYkrmbaJtG0T0eDrPISowk5bXlC_Ny8N971iOQ3Px43Eues2OEeF0HhdSqaF6oHW2S94JCC_Zr22ODR7OqMR87nLFLCXthUPVhSwqWXaJvBEN0cV67Ni8dwDvXczES-5s2l4wUM',
    albumTitle: 'The New Abnormal',
    albumCover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2Uvj07uHUoOYryLc83jWS5B5Kg1WC13gmNKDFm-ZAuMXXW8IqNsdXG3gqYDhj0NGKyDH-fb8CH5dXbnsWE431BX40WFM1Hzhku0Ye0dWDon-xskmpS7D_CZjZhUyu7LAw42FyYkXpurf5cT5YyXVQW1AYHyY3XXSSXPEmZLgibQR9lddI82DtIXjgTbRv-un39Xs1YqUxnJUbeUA8NJwe_7FviGrh75sjs2RLGnhIropVjnsq7LsERH62adLHPmgIuZjrMOTYeCI',
    rating: 4.5,
    content: "This album feels like a return to form for The Strokes. The production by Rick Rubin is crisp, and Julian Casablancas' vocals have never sounded more emotive. Standout tracks like 'Selfless' and 'Ode to the Mets' are instant classics.",
    timestamp: '2h ago',
    likes: 124,
    comments: 18,
    type: 'review'
  }
];
