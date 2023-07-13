<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"/>
<link rel='stylesheet' href='{$baseurl}/../../{$css}' type='text/css' />
<link type='text/css' href='{$baseurl}/../../css/loris-jquery/jquery-ui-1.10.4.custom.min.css' rel='Stylesheet' />
<link rel='stylesheet' href='{$baseurl}/../../bootstrap/css/bootstrap.min.css'>
<link rel='stylesheet' href='{$baseurl}/../../bootstrap/css/custom-css.css'>

<!-- shortcut icon that displays on the browser window -->
<link rel="shortcut icon" href="{$baseurl}/images/mni_icon.ico" type="image/ico" />
<!-- page title -->
<title>Acknowledgements</title>
<!--  end page header -->
</head>

<body>

<div id="tabs" style="background: white">
    <div class="tab-content">
        <div class="tab-pane active">
            <table class='table table-hover table-primary table-bordered table-unresolved-conflicts dynamictable' border='0'>
                <thead>
                    <tr class='info'>
                    {foreach from=$columns key=k item=v}
                        <th>
                            {$v}
                        </th>
                    {/foreach}
                    </tr>
                </thead>
                {foreach from=$results key=k item=v}
                    <tr> 
                        {foreach from=$v key=k2 item=v2}
                            <td>
                            {$v2|replace:",":", "|replace:"_":" "|capitalize}
                            </td>
                        {/foreach}
                    </tr>
                {/foreach}
            </table>
        </div>
    </div>
</div>
<br>

<form action='' method='post'>
    <div align="center">
        <input class='btn btn-primary' type='submit' value='Download as CSV'>
    </div>
</form>

</body>

</html>
