<script>
    import createForm from '~/utils/form.js';
    import { session, redirectData } from '~/utils/store.js';
    import { goto } from '@roxi/routify';
    import { onMount } from 'svelte';


    const formId = 'form-login';
    const { initialize, submitting } = createForm(formId, {
        action: SESS_API_URL,
        credentials: 'omit',

        feedback: {
            classes: {error: ['text-danger']},
            elem: {password: ['.hint']},
        },

        success(data) {
            data.expired_at = Date.now() + (data.duration * 1000)
            $session = data;
            $goto($redirectData.prevUrl || '/')
        },
    })

    onMount(initialize)
</script>

<main class="container">
    <article class="grid">
        <div>
            <hgroup>
                <h1>Sign in</h1>
                <h2>A minimalist layout for Login pages</h2>
            </hgroup>
            <form id={formId}>
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
