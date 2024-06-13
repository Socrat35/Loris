Subject: Account Changes for {$realname} on {$study}
<!-- modified from https://github.com/leemunroe/responsive-html-email-template/blob/master/email.html-->
<!doctype html>
<html lang="en">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Changes to Account Status</title>
        <style media="all" type="text/css">
            /* -------------------------------------
            GLOBAL RESETS
        ------------------------------------- */

            body {
                font-family: Helvetica, sans-serif;
                -webkit-font-smoothing: antialiased;
                font-size: 16px;
                line-height: 1.3;
                -ms-text-size-adjust: 100%;
                -webkit-text-size-adjust: 100%;
            }

            table {
                border-collapse: separate;
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                width: 100%;
            }

            table td {
                font-family: Helvetica, sans-serif;
                font-size: 16px;
                vertical-align: top;
            }

            span.bold {
                font-weight: bold;
            }

            span.emphasis {
                font-style: italic;
            }
            /* -------------------------------------
            BODY & CONTAINER
        ------------------------------------- */

            body {
                background-color: #f4f5f6;
                margin: 0;
                padding: 0;
            }

            .body {
                background-color: #f4f5f6;
                width: 100%;
            }

            .container {
                margin: 0 auto !important;
                max-width: 600px;
                padding: 0;
                padding-top: 24px;
                width: 600px;
            }

            .content {
                box-sizing: border-box;
                display: block;
                margin: 0 auto;
                max-width: 600px;
                padding: 0;
            }

            img {
                float: right;
                width: 50%;
            }
            /* -------------------------------------
            HEADER, FOOTER, MAIN
        ------------------------------------- */

            .main {
                background: #ffffff;
                border: 1px solid #eaebed;
                border-radius: 16px;
                width: 100%;
            }

            .wrapper {
                box-sizing: border-box;
                padding: 24px;
            }

            .footer {
                clear: both;
                padding-top: 24px;
                text-align: center;
                width: 100%;
            }

            .footer td,
            .footer p,
            .footer span,
            .footer a {
                color: #9a9ea6;
                font-size: 16px;
                text-align: center;
            }
            /* -------------------------------------
            TYPOGRAPHY
        ------------------------------------- */

            p {
                font-family: Helvetica, sans-serif;
                font-size: 16px;
                font-weight: normal;
                margin: 0;
                margin-bottom: 16px;
            }

            a {
                color: #0867ec;
                text-decoration: underline;
            }
            /* -------------------------------------
            BUTTONS
        ------------------------------------- */

            .btn {
                box-sizing: border-box;
                min-width: 100% !important;
                width: 100%;
            }

            .btn > tbody > tr > td {
                padding-bottom: 16px;
            }

            .btn table {
                width: auto;
            }

            .btn table td {
                background-color: #ffffff;
                border-radius: 4px;
                text-align: center;
            }

            .btn a {
                background-color: #ffffff;
                border: solid 2px #0867ec;
                border-radius: 4px;
                box-sizing: border-box;
                color: #0867ec;
                cursor: pointer;
                display: inline-block;
                font-size: 16px;
                font-weight: bold;
                margin: 0;
                padding: 12px 24px;
                text-decoration: none;
                text-transform: capitalize;
            }

            .btn-primary table td {
                background-color: #0867ec;
            }

            .btn-primary a {
                background-color: #0867ec;
                border-color: #0867ec;
                color: #ffffff;
            }

            @media all {
                .btn-primary table td:hover {
                    background-color: #ec0867 !important;
                }
                .btn-primary a:hover {
                    background-color: #ec0867 !important;
                    border-color: #ec0867 !important;
                }
            }

            /* -------------------------------------
            OTHER STYLES THAT MIGHT BE USEFUL
        ------------------------------------- */

            .last {
                margin-bottom: 0;
            }

            .first {
                margin-top: 0;
            }

            .align-center {
                text-align: center;
            }

            .align-right {
                text-align: right;
            }

            .align-left {
                text-align: left;
            }

            .text-link {
                color: #0867ec !important;
                text-decoration: underline !important;
            }

            .clear {
                clear: both;
            }

            .mt0 {
                margin-top: 0;
            }

            .mb0 {
                margin-bottom: 0;
            }

            .preheader {
                color: transparent;
                display: none;
                height: 0;
                max-height: 0;
                max-width: 0;
                opacity: 0;
                overflow: hidden;
                mso-hide: all;
                visibility: hidden;
                width: 0;
            }

            .powered-by a {
                text-decoration: none;
            }

            /* -------------------------------------
            RESPONSIVE AND MOBILE FRIENDLY STYLES
        ------------------------------------- */

            @media only screen and (max-width: 640px) {
                .main p,
                .main td,
                .main span {
                    font-size: 16px !important;
                }
                .wrapper {
                    padding: 8px !important;
                }
                .content {
                    padding: 0 !important;
                }
                .container {
                    padding: 0 !important;
                    padding-top: 8px !important;
                    width: 100% !important;
                }
                .main {
                    border-left-width: 0 !important;
                    border-radius: 0 !important;
                    border-right-width: 0 !important;
                }
                .btn table {
                    max-width: 100% !important;
                    width: 100% !important;
                }
                .btn a {
                    font-size: 16px !important;
                    max-width: 100% !important;
                    width: 100% !important;
                }
            }
            /* -------------------------------------
            PRESERVE THESE STYLES IN THE HEAD
        ------------------------------------- */

            @media all {
                .ExternalClass {
                    width: 100%;
                }
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                    line-height: 100%;
                }
                .apple-link a {
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    text-decoration: none !important;
                }
                #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                    font-size: inherit;
                    font-family: inherit;
                    font-weight: inherit;
                    line-height: inherit;
                }
            }
        </style>
    </head>
    <body>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
            <tr>
                <td>&nbsp;</td>
                <td class="container">
                    <div class="content">
                        <!-- START CENTERED WHITE CONTAINER -->
                        <span class="preheader">Changes in the account of {$realname} on the {$study} site.</span>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
                            <!-- START MAIN CONTENT AREA -->
                            <tr>
                                <td class="wrapper">
                                    <img src="{$url}/images/PreventAD_logo.png" alt="PREVENT-AD Logo" title="PREVENT-AD Logo" width="250" height="150" border="0" style="border:0; outline:none; text-decoration:none; display:block; float: right;">
                                    <p>Hello {$realname},</p>
                                    <p>Settings in your account on the {$study} systems have been updated.</p>
                                    {if !empty($password)}
                                        <p>The following username and temporary password will allow you to login.</p>
                                        <p>Upon logging in, you'll be prompted to generate your own password.</p>
                                        <div>
                                            <ul>
                                                <li><span class="bold">Username:</span> {$username}</li>
                                                <li><span class="bold">Password:</span> {$password}</li>
                                            </ul>
                                        </div>
                                        <br/>
                                        <p>You can log in using the following link: <a href="{$url}" rel="noreferrer noopener" target="_blank">{$url}</a> or as you normally would.</p>
                                        <p>Sincerely,<br/>The team at {$study}</p>
                                    {else}
                                        <p>Your username is still:</p>
                                        <div>
                                            <ul>
                                                <li><span class="bold">Username:</span> {$username}</li>
                                            </ul>
                                        </div>
                                        <br/>
                                        <p>You can log in using the following link: <a href="{$url}" rel="noreferrer noopener" target="_blank">{$url}</a> or as you normally would.</p>
                                        <p>Sincerely,<br/>The team at {$study}</p>
                                    {/if}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <hr style="margin-right: 15%; margin-left: 15%;">
                                </td>
                            </tr>
                            <tr>
                                <td class="wrapper">
                                    <h1 class="align-center" style="margin-bottom: 0px;">Terms of Use</h1>
                                    <div class="wrapper">
                                        <h3>Publications</h3>
                                        <div class="wrapper">
                                            <p>For all <span class="emphasis bold">abstracts</span> and <span class="emphasis bold">manuscripts</span> published using data from PREVENT-AD, I agree to the following:</p>
                                        </div>
                                        <div class="wrapper" style="background-color: lightgray; border-radius: 10px;">
                                            <p><span class="bold">Authorship:</span></p>
                                            <p class="align-center">On the by-line of the abstract or manuscript, after the named authors, I will include the phrase "<span class="emphasis">The PREVENT-AD Research Group</span>".</p>
                                            <p>A listing of the PREVENT-AD Research Group's Investigators, authors' list, can be accessed through the PREVENT-AD systems using the following link: <a href="https://preventad.loris.ca/acknowledgements/acknowledgements.php?Stage=2&authors" rel="noreferrer noopener" target="_blank">https://preventad.loris.ca/acknowledgements/acknowledgements.php?Stage=2&authors</a></p>
                                        </div>
                                        <br/>
                                        <div class="wrapper" style="background-color: lightgray; border-radius: 10px;">
                                            <p><span class="bold">Methods:</span></p>
                                            <p>I will add, in the methods' section, the following sentence:</p>
                                            <p class="align-center">"<span class="emphasis">Data used in preparation of this article were obtained from the PRe-symptomatic EValuation of Experimental or Novel Treatments for Alzheimer’s Disease (PREVENT-AD) Registered repository available at <a href="https://registeredpreventad.loris.ca" target="_blank" rel="noreferrer noopener">https://registeredpreventad.loris.ca</a></span>"</p>
                                            <p>This sentence, if applicable, can also be added:</p>
                                            <p class="align-center">"<span class="emphasis">The Investigators of the PREVENT-AD program contributed to the design and implementation of PREVENT-AD and/or provided data but did not participate in data analysis or writing of this report.</span>"</p>
                                        </div>
                                        <br/>
                                        <div class="wrapper" style="background-color: lightgray; border-radius: 10px;">
                                            <p><span class="bold">Reference Papers Linked To PREVENT-AD:</span></p>
                                            <p>"<span class="emphasis">I will cite at least one of the following reference papers.</span>"</p>
                                            <p><span class="emphasis bold">Stage 2.0:</span> <a href="#" target="_blank" rel="noreferrer noopener">PREVENT-AD Stage 2 open data release: neuroimaging, behavioral and follow-up cognitive data in older adults at risk of Alzheimer's disease, Pichet-Binette et al, 2024 - preprint</a></p>
                                            <p><span class="emphasis bold">Stage 1.0:</span> <a href="https://pubmed.ncbi.nlm.nih.gov/34192666/" rel="noreferrer noopener" target="_blank">Open science datasets from PREVENT-AD, a longitudinal cohort of pre-symptomatic Alzheimer's disease, Tremblay-Mercier et al., 2021.</a></p>
                                            <p><span class="bold emphasis">Conceptual paper:</span> <a href="https://pubmed.ncbi.nlm.nih.gov/29199324/" target="_blank" rel="noreferrer noopener">Rationale and Structure for a new Center for Studies on Prevention of Alzheimer’s Disease (StoP-AD) Breitner, et al 2016</a></p>
                                        </div>
                                    </div>
                                    <div class="wrapper">
                                        <h3>Commercialization</h3>
                                        <div class="wrapper" style="background-color: lightgray; border-radius: 10px;">
                                            <p class="align-center">"<span class="emphasis">I will not attempt to sell or claim intellectual property rights in the PREVENT-AD dataset.</span>"</p>
                                        </div>
                                    </div>
                                    <div class="wrapper">
                                        <h3>Privacy</h3>
                                        <div class="wrapper" style="background-color: lightgray; border-radius: 10px;">
                                            <p class="align-center">"<span class="emphasis">I will not attempt to re-identify or re-contact individual participants. In particular, I will not link the data to other datasets if that could lead to their re-identification.</span>"</p>
                                        </div>
                                    </div>
                                    <div class="wrapper">
                                        <h3>Ethical Oversight</h3>
                                        <div class="wrapper" style="background-color: lightgray; border-radius: 10px;">
                                            <p class="align-center">"<span class="emphasis">I will obtain any required approvals for the use of the PREVENT-AD dataset.</span>"</p>
                                        </div>
                                    </div>
                                    <div class="wrapper">
                                        <h3>Use Restriction</h3>
                                        <div class="wrapper" style="background-color: lightgray; border-radius: 10px;">
                                            <p class="align-center">"<span class="emphasis">This open PREVENT-AD dataset must be used for ‘neurosciences research’ as stipulated in the consent form.</span>"</p>
                                        </div>
                                    </div>
                                    <div class="wrapper">
                                        <h3>Confidentiality</h3>
                                        <div class="wrapper" style="background-color: lightgray; border-radius: 10px;">
                                            <p class="align-center">"<span class="emphasis">Sharing of this dataset must be done through this portal. Do not redistribute the data yourself. Redirect potential users to this portal so they can register and agree to these terms.</span>"</p>
                                        </div>
                                    </div>
                                    <div class="wrapper">
                                        <h3>Monitoring</h3>
                                        <div class="wrapper" style="background-color: lightgray; border-radius: 10px;">
                                            <p class="align-center">"<span class="emphasis">I will respond to requests from PREVENT-AD, if any. I will immediately report to PREVENT-AD activity that breaches these terms.</span>"</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <!-- END MAIN CONTENT AREA -->
                        </table>
                        <!-- START FOOTER -->
                        <div class="footer">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td class="content-block">
                                        <span class="apple-link">SToP-AD Centre</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="content-block powered-by">
                                        Powered by <a href="{$url}">{$url}</a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <!-- END FOOTER -->
                        <!-- END CENTERED WHITE CONTAINER --></div>
                </td>
                <td>&nbsp;</td>
            </tr>
        </table>
    </body>
</html>
