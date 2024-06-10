<?php
/**
 * Handles a request to the project's Data Releases export portion of the LORIS API
 *
 * PHP Version 7
 *
 * @category Main
 * @package  API
 * @author   Cécile Madjar <cecile.madjar2@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

namespace Loris\API\Projects;
//Load config file and ensure paths are correct
set_include_path(get_include_path() . ":" . __DIR__ . "/../");

require_once 'APIBase.php';

/**
 * Class to handle project's Data Release export portion of the LORIS API
 *
 * @category Main
 * @package  API
 * @author   Cécile Madjar <cecile.madjar2@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class DataReleases extends \Loris\API\APIBase
{
    var $RequestData;
    private $_project;

    /**
     * Create a Data Release request handler
     *
     * @param string $method      The HTTP request method of the request
     * @param string $projectName The data that was POSTed to the request
     */
    public function __construct($method, $projectName)
    {

        $this->AllowedMethods = array('GET');
        $this->AutoHandleRequestDelegation = false;

        parent::__construct($method);

        // Turning off the API for data release until usage has been clarified
        $this->header("HTTP/1.1 501 Not Implemented");
        $this->error(['error' => 'Currently unavailable. Please use the web front-end.']);
        $this->safeExit(0);

        try {
            $this->_project = $this->Factory->project($projectName);
        } catch (\LorisException $e) {
            $this->header("HTTP/1.1 404 Not Found");
            $this->error(['error' => 'Invalid project']);
            $this->safeExit(0);
        }

        try {
            $dateString = $data['since'] ?? '1970-01-01';
            $this->RequestData['since'] = new \DateTime($dateString);
        } catch(\Exception $e) {
            $this->header("HTTP/1.1 400 Bad Request");
            $this->error(['error' => 'Invalid date']);
            $this->safeExit(0);
        }

        $this->handleRequest();

    }

    /**
     * Calculate an ETag by taking a hash of the number of Data Release files in the
     * database and the time of the most recently changed one.
     *
     * @return string An ETag for ths candidates object
     */
    function calculateETag()
    {
        return md5('Releases:' . json_encode($this->JSON, true));
    }

    /**
     * Handles a bids GET request
     *
     * @return void but populates $this->JSON
     */
    public function handleGET()
    {
        $data_release_versions = $this->DB->pselect(
            "SELECT DISTINCT(version) FROM data_release",
            array()
        );

        $data_release_arr = array();

        foreach ($data_release_versions as $row) {
            $version    = $row['version'];
            $files_list = $this->DB->pselect(
                "SELECT file_name FROM data_release WHERE version = :version",
                array('version' => $version)
            );
            $files_path_list = array_map(
                function ($item) {
                    return array(
                        'File' => $item['file_name'],
                        'Link' => 'projects/loris/data_releases/' . $item['file_name'],
                    );
                },
                $files_list
            );
            array_push(
                $data_release_arr,
                array(
                    'Data_Release_Version' => $version,
                    'Files'                => $files_path_list,
                )
            );
        }

        $this->JSON = $data_release_arr;
    }
}

if (isset($_REQUEST['PrintFiles'])) {
    $obj = new DataReleases(
        $_SERVER['REQUEST_METHOD'],
        $_REQUEST['project_name']
    );
    print $obj->toJSONString();
}
