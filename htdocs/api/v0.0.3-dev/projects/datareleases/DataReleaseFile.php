<?php
/**
 * Handles API requests for the data release file download
 *
 * PHP Version 5.5+
 *
 * @category Main
 * @package  API
 * @author   Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
namespace Loris\API\Projects\DataReleases;
set_include_path(get_include_path() . ":" . __DIR__ . "/../");
require_once __DIR__ . '/../DataReleases.php';
/**
 * Handles API requests for the data release file download.
 *
 * @category Main
 * @package  API
 * @author   Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class DataReleaseFile extends \Loris\API\Projects\DataReleases
{
    var $RequestData;
    private $_project;

    /**
     * @param string $method      The method of the HTTP request
     * @param string $projectName The name of the project
     * @param string $Filename    The file name to be retrieved
     */
    public function __construct($method, $projectName, $Filename)
    {
        $requestDelegationCascade = $this->AutoHandleRequestDelegation;

        $this->AutoHandleRequestDelegation = false;

        if (empty($this->AllowedMethods)) {
            $this->AllowedMethods = ['GET', 'HEAD'];
        }
        $this->Filename = $Filename;

        parent::__construct($method, $projectName);

        // Turning off the API for data release until usage has been clarified
        $this->header("HTTP/1.1 501 Not Implemented");
        $this->error(['error' => 'Currently unavailable. Please use the web front-end.']);
        $this->safeExit(0);

        $results = $this->getDatabaseDir();
        if (true) {
            $this->header("HTTP/1.1 404 Not Found");
            $this->error("File not found");
            $this->safeExit(0);
        }

        if ($requestDelegationCascade) {
            $this->handleRequest();
        }

    }

    /**
     * Handles a GET request
     *
     * @return void but populates $this->JSON
     */
    public function handleGET()
    {
        $fullDir = $this->getFullPath();
        ob_end_clean();

        $fp = fopen($fullDir, "r");
        if ($fp === false) {
            $this->header("HTTP/1.1 500 Internal Server Error");
            error_log("Could not open $fullDir to send to client");
            $this->safeExit(1);
        }

        $this->Header('Cache-control: private');

        if (pathinfo($fullDir)['extension'] == 'csv') {
            $contentType = 'text/csv';
        } else {
            $contentType = 'text/plain';
        }
        $this->Header("Content-Type: $contentType");
        $this->Header('Content-Length: ' . filesize($fullDir));
        $this->Header('Content-Disposition: attachment; filename=' . basename($this->Filename));

        fpassthru($fp);
        fclose($fp);
        $this->safeExit(0);
    }

    /**
     * Gets the full path of this image on the filesystem, in order
     * to be able to pass it to an fopen command (or similar)
     *
     * @return string
     */
    protected function getFullPath()
    {
        return $this->getDataReleaseDir() . "/" . $this->getDatabaseDir();
    }

    /**
     * Gets the root of the base directory of the LORIS code, so that we know where
     * to retrieve images relative to.
     *
     * @return string
     */
    protected function getDataReleaseDir()
    {
        $factory = \NDB_Factory::singleton();
        $config  = $factory->Config();
        return $config->getSetting("base") . '/project/modules/data_release/user_uploads/';
    }

    /**
     * Gets the filename saved in the database for this file
     *
     * @return string
     */
    protected function getDatabaseDir()
    {
        $factory = \NDB_Factory::singleton();
        $db      = $factory->Database();
        return $db->pselectOne(
            "SELECT file_name
                FROM data_release
                WHERE file_name LIKE CONCAT('%', :Fname)",
            array(
                'Fname' => $this->Filename,
            )
        );
    }

}

if (isset($_REQUEST['PrintFileData'])) {
    $obj = new DataReleaseFile(
        $_SERVER['REQUEST_METHOD'],
        $_REQUEST['project_name'],
        $_REQUEST['Filename']
    );
    print $obj->toJSONString();
}
