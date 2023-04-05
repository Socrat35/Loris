<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content={if $authorship == "1"}"List of the Authors for the PREVENT-AD Dataset"{else}"Acknowledgements for the contributors to the PREVENT-AD Dataset"{/if}>
        <link rel='stylesheet' type='text/css' href='{$baseurl}/{$css}' />
        <link rel='stylesheet' type='text/css' href='{$baseurl}/css/loris-jquery/jquery-ui-1.10.4.custom.min.css' />
        <link rel='stylesheet' type='text/css' href='{$baseurl}/bootstrap/css/bootstrap.min.css'>
        <link rel='stylesheet' type='text/css' href='{$baseurl}/bootstrap/css/custom-css.css'>
        <link rel='stylesheet' type='text/css' href='{$baseurl}/css/acknowledgements.css' />
        <link rel="shortcut icon" type="image/ico" href="{$baseurl}/images/PreventAD.ico" />
        <title>{if $authorship == "1"}Authorship{else}Acknowledgements{/if}</title>
    </head>
    <body>
        <div class="page-header-banner">
            <img class="logo img-responsive" src="{$baseurl}/images/preventadlogo.png"/>
        </div>
        <div id="tabs">
            <h1>{if $authorship == "1"}Authorship List for the PREVENT-AD Dataset{else}Acknowledgements for the contributors to the PREVENT-AD Dataset{/if}</h1>
            <h4>{if $authorship == "1"}<a href="{$baseurl}/acknowledgements/acknowledgements2.php?date={$date}">Acknowledgements List</a>{else}<a href="{$baseurl}/acknowledgements/acknowledgements2.php?date={$date}&authors">Authorship List</a>{/if}</h4>
            <div class="tab-content">
                <div class="tab-pane active">
                    <table class='table table-bordered'>
                        <thead>
                            <tr class='info'>
                            {foreach from=$columns key=columnName item=ColumnDisplayName}
                                <th class="text-center">
                                    {$ColumnDisplayName}
                                </th>
                            {/foreach}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            {foreach from=$results item=person}
                                    <td class="text-center">{$person["Full Name"]}</td>
                                    <td class="text-center">{$person["Citation Name"]}</td>
                                    <td class="align-center">
                                        {function RecursivePrint}
                                            <ul>
                                                {foreach $person_affiliations as $affiliation}
                                                    {if is_array($affiliation)}
                                                        <li class="item">{$affiliations[$affiliation@key]["Name"]}, {$affiliations[$affiliation@key]["City"]}, {$affiliations[$affiliation@key]["StateCode"]}, {$affiliations[$affiliation@key]["CountryCode"]}</li>
                                                        {RecursivePrint person_affiliations=$affiliation}
                                                    {else}
                                                        <li class="item">{$affiliation}</li>
                                                    {/if}
                                                {/foreach}
                                            </ul>
                                        {/function}
                                        {RecursivePrint person_affiliations=$person["Affiliation IDs"]}
                                    </td>
                                    <td>
                                        <ul>
                                            {foreach from=$person["Degree IDs"] item=degreeIDs}
                                                <li>{$degrees[$degreeIDs]["Abbreviation"]}</li>
                                            {foreachelse}
                                            {/foreach}
                                        </ul>
                                    </td>
                                    <td>
                                        <ul>
                                            {foreach from=$person["Title IDs"] item=titleIDs}
                                                <li>{$titles[$titleIDs]["Abbreviation"]}</li>
                                            {/foreach}
                                        </ul>
                                    </td>
                                    <td>
                                        <ul>
                                            {foreach from=$person["Role IDs"] item=roleIDs}
                                                <li>{$roles[$roleIDs]["Name"]}</li>
                                            {/foreach}
                                        </ul>
                                    </td>
                                </tr>
                            {/foreach}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </body>
</html>
