// public/js/auth.js
// Authentication & Profile Manager with Supabase Auth & Local Session Fallback

const Auth = (() => {
  const SESSION_KEY = 'fitai_auth_session';
  const PROFILE_KEY = 'fitai_user_profile';
  let supabaseClient = null;

  // Initialize Supabase if credentials exist
  function initSupabase() {
    const url = window.SUPABASE_URL || localStorage.getItem('supabase_url');
    const key = window.SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key');
    if (url && key && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(url, key);
        console.log('⚡ Supabase Client initialized successfully.');
      } catch (e) {
        console.warn('Supabase client init failed:', e);
      }
    }
  }

  // Get current active session
  function getSession() {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function isAuthenticated() {
    const s = getSession();
    return Boolean(s && s.user && s.token);
  }

  function getCurrentUser() {
    const s = getSession();
    return s ? s.user : null;
  }

  function getAuthToken() {
    const s = getSession();
    return s ? s.token : null;
  }

  // Sign Up
  async function signUp(email, password, name) {
    if (!email || !password) throw new Error('Email and password are required.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { name: name || 'Athlete' } }
      });
      if (error) throw error;
      const session = {
        user: { id: data.user.id, email: data.user.email, name: name || 'Athlete' },
        token: data.session ? data.session.access_token : 'sb-auth-' + Date.now()
      };
      saveSession(session);
      return session;
    }

    // Local / Demo Authenticated Registration
    const user = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      email: email.trim().toLowerCase(),
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    const session = {
      user,
      token: 'jwt_token_' + btoa(user.id + ':' + user.email)
    };
    saveSession(session);
    return session;
  }

  // Sign In
  async function signIn(email, password) {
    if (!email || !password) throw new Error('Please enter both email and password.');

    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const session = {
        user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || 'Athlete' },
        token: data.session.access_token
      };
      saveSession(session);
      return session;
    }

    // Local Verification (or guest check)
    const user = {
      id: 'usr_' + btoa(email.trim().toLowerCase()).substr(0, 10),
      email: email.trim().toLowerCase(),
      name: email.split('@')[0],
      isGuest: false
    };
    const session = {
      user,
      token: 'token_' + btoa(user.id)
    };
    saveSession(session);
    return session;
  }

  // Instant Guest / Demo Mode
  function startGuestDemoSession() {
    const user = {
      id: 'guest-user-demo',
      email: 'demo@fitaicoach.app',
      name: 'Alex Rivera',
      isGuest: true
    };
    const session = {
      user,
      token: 'guest-demo-token'
    };
    saveSession(session);

    // Provide rich starter profile
    const demoProfile = {
      id: user.id,
      name: 'Alex Rivera',
      age: 26,
      sex: 'male',
      height: 178,
      weight: 74,
      target_weight: 70,
      unit_preference: 'metric',
      fitness_goal: 'fat_loss',
      activity_level: 'moderate',
      yoga_experience: 'intermediate',
      workout_experience: 'intermediate',
      dietary_preference: 'vegetarian',
      allergies: [],
      equipment: ['bodyweight', 'yoga_mat', 'dumbbells'],
      daily_duration: 35,
      health_limitations: 'Mild lower back stiffness in morning',
      onboardingComplete: true
    };
    saveProfile(demoProfile);
    return session;
  }

  // Sign Out
  async function signOut() {
    if (supabaseClient) {
      try { await supabaseClient.auth.signOut(); } catch (e) {}
    }
    localStorage.removeItem(SESSION_KEY);
    window.location.hash = '#auth';
  }

  // Reset Password
  async function resetPassword(email) {
    if (!email) throw new Error('Please enter your registered email.');
    if (supabaseClient) {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    }
    // Simulated reset link for demo mode
    return true;
  }

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  // Profile Management
  function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // Trigger sync to server
    syncProfileToServer(profile);
  }

  function loadProfile() {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return null;
  }

  async function syncProfileToServer(profile) {
    const token = getAuthToken();
    if (!token) return;
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
    } catch (e) {
      console.warn('Profile background sync pending offline:', e);
    }
  }

  // Auto initialize on load
  initSupabase();

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    startGuestDemoSession,
    isAuthenticated,
    getCurrentUser,
    getAuthToken,
    saveProfile,
    loadProfile
  };
})();
