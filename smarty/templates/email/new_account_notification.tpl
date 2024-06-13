Subject: Account Request: {$firstname} {$lastname} from {$instance}
<!-- modified from https://github.com/leemunroe/responsive-html-email-template/blob/master/email.html-->
<!doctype html>
<html lang="en">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>New Account Request</title>
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
                        <span class="preheader">{$firstname} {$lastname} just requested a new account on the {$instance} instance.</span>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
                            <!-- START MAIN CONTENT AREA -->
                            <tr>
                                <td class="wrapper">
                                    <img src="{$instance}/images/PreventAD_logo.png" alt="PREVENT-AD Logo" width="250" height="150" border="0" style="border:0; outline:none; text-decoration:none; display:block; float: right;">
                                    <p>Hello {$administrator},</p>
                                    <p>A user just requested a new account on the {$instance} instance. Here are the details:</p>
                                    <ul>
                                        <li><span class="bold">UserID: </span>{$email}</li>
                                        <li><span class="bold">First Name: </span>{$firstname}</li>
                                        <li><span class="bold">Last Name: </span>{$lastname}</li>
                                        <li><span class="bold">Email: </span>{$email}</li>
                                        <li><span class="bold">ORCID: </span>{if !empty($orcid)}{$orcid}{else}No ORCID provided{/if}</li>
                                        <li><span class="bold">Institution: </span>{if !empty($institution)}{$institution}{else}No Institution provided{/if}</li>
                                        <li><span class="bold">University: </span>{if !empty($university)}{$university}{else}No University provided{/if}</li>
                                        <li><span class="bold">Country: </span>{$country}</li>
                                        <li>
                                            <span class="bold">Wanted Data: </span>
                                            {foreach from=$data item=data_wanted}
                                                <ul>
                                                    <li>{$data_wanted}</li>
                                                </ul>
                                            {foreachelse}
                                                No Wanted Data were provided. Please check with your nearest system administrator.
                                            {/foreach}
                                        </li>
                                        <li>
                                            <span class="bold">Expected Uses: </span>
                                            {foreach from=$uses item=expected_uses}
                                                <ul>
                                                    <li>{$expected_uses}</li>
                                                </ul>
                                                {foreachelse}
                                                No Expected Uses were provided. Please check with your nearest system administrator.
                                            {/foreach}
                                        </li>
                                        <li><span class="bold">Binary Questions: </span>
                                            <ul>
                                                {foreach from=$questions key=questionID item=question}
                                                    <li>{$question['QuestionText']}: <span class="bold">{$question['Answer']}</span></li>
                                                {/foreach}
                                            </ul>
                                        </li>
                                    </ul>
                                    <p>Upon confirmation of the validity of the request, you can activate the account as soon as you want.</p>
                                    <p>Sincerely,<br/>Your friendly local LORIS instance</p>
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
                                        Powered by <a href="{$instance}">{$instance}</a>
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
