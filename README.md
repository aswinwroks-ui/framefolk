# Framefolk

A responsive campaign-frame website with campaign browsing, search and filters, photo positioning, PNG downloads, and browser-local campaign creation.

## Publish with GitHub Pages

1. Create a repository named `framefolk` in your GitHub account. A public repository supports GitHub Pages on GitHub Free.
2. Upload this folder's contents to the repository root: `index.html`, `style.css`, `app.js`, and `.nojekyll`.
3. Open repository **Settings → Pages**.
4. Choose **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
5. Wait for GitHub's Pages deployment to finish. The Pages settings will show the published website URL.

No installation or build step is required. Relative asset links support project sites such as `/framefolk/`.

## Campaign links and data

Sample campaigns support links such as `?campaign=earth`. Participant photos are processed locally and are not uploaded to a server. Custom campaigns are stored in the browser that creates them; they do not sync to other devices and cannot yet be shared by campaign link. GitHub Pages hosts static files and does not add a shared campaign database.

## Reference

GitHub Pages publishing instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
