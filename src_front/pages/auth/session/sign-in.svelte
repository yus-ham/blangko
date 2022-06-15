<script>
  import createForm from '~/utils/form.js';
  import { session } from '~/utils/store.js';
  import { onMount } from 'svelte';


  const formId = 'form-login';
  const { initialize, submitting } = createForm(formId, {
    checkAuth: false,
    errorClass: ['text-danger'],
    errorsMap: {password: ['.hint']},

    // this will trigger $goto(prevUrl), @see _reset.svelte
    success: (data) => $session = data,
  });

  onMount(initialize);
</script>

<main class="container">
  <article class="grid">
    <div>
      <hgroup>
        <h1>Sign in</h1>
        <h2>A minimalist layout for Login pages</h2>
      </hgroup>
      <form id={formId} method="post" action={api('auth/session')}>
        <input name="username" placeholder="Enter username" aria-label="Enter username" autocomplete="nickname" required />
        <input type="password" name="password" placeholder="Password" aria-label="Password" autocomplete="current-password" required />
        <fieldset>
          <label for="remember">
            <input type="checkbox" role="switch" id="remember" name="remember" />
            Remember me
          </label>
        </fieldset>
        <button type="submit" class="contrast" disabled={$submitting}>Login</button>
        <div class="hint"></div>
      </form>
      <small>&raquo; <a href="forgot-password">I forgot password</a></small><br />
      <small>&raquo; <a href="sign-up">Create account</a></small>
    </div>
  </article>
</main>

<style>
  @media (min-width: 425px) {
    .container {
      width: 425px;
    }
  }
</style>
