<?php declare(strict_types=1);
/**
 * PHP Version 7
 *
 * @category API
 * @package  LORIS
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

namespace LORIS\api\Models;

/**
 * A ProjectElectrophysiologyRow contains values from a recording of a project.
 *
 * @category API
 * @package  LORIS
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

class ProjectRecordingsRow implements \LORIS\Data\DataInstance
{
    private $_candid;
    private $_pscid;
    private $_entitytype;
    private $_visitlabel;
    private $_visitdate;
    private $_centerid;
    private $_centername;
    private $_filename;
    private $_modality;
    private $_inserttime;

    /**
     * Create a new ProjectElectrophysiologyRow.
     *
     * @param array $row An array of image properties
     */
    public function __construct(array $row)
    {
        $this->_candid        = $row['Candidate'] ?? null;
        $this->_pscid         = $row['PSCID'] ?? null;
        $this->_entitytype    = $row['Entity_type'] ?? null;
        $this->_visitlabel    = $row['Visit'] ?? null;
        $this->_visitdate     = $row['Visit_date'] ?? null;
        $this->_centerid      = $row['CenterID'] ?? null;
        $this->_centername    = $row['Site'] ?? null;
        $this->_modality      = $row['Modality'] ?? null;
        $this->_filename      = $row['RecordingFile'] ?? null;
        $this->_channelfile   = $row['ChannelFile'] ?? null;
        $this->_electrodefile = $row['ElectrodeFile'] ?? null;
        $this->_eventfile     = $row['EventFile'] ?? null;
        $this->_jsonfile      = $row['JsonFile'] ?? null;
        $this->_inserttime    = $row['InsertTime'] ?? null;
    }

    /**
     * Implements \LORIS\Data\DataInstance interface for this row.
     *
     * @return string the row data.
     */
    public function toJSON() : string
    {
        $obj = array(
            'Candidate'     => $this->_candid,
            'PSCID'         => $this->_pscid,
            'Visit'         => $this->_visitlabel,
            'Visit_date'    => $this->_visitdate,
            'Site'          => $this->_centername,
            'Modality'      => $this->_modality,
            'InsertTime'    => $this->_inserttime,
        );

        $filename = basename($this->_filename);
        $candid   = $obj['Candidate'];
        $visit    = $obj['Visit'];

        # get the recording file link
        $obj['RecordingFileLink'] = "/candidates/$candid/$visit/recordings/$filename";

        # get the recording's associated BIDS files
        $obj['ChannelsFileLink'] = (
            $this->_channelfile ?
            "/candidates/$candid/$visit/recordings/$filename/bidsfiles/channels" : null
        );
        $obj['ElectrodesFileLink'] = (
        $this->_electrodefile ?
            "/candidates/$candid/$visit/recordings/$filename/bidsfiles/electrodes" : null
        );
        $obj['EventsFileLink'] = (
        $this->_eventfile ?
            "/candidates/$candid/$visit/recordings/$filename/bidsfiles/events" : null
        );
        $obj['JSONFileLink'] = (
        $this->_jsonfile ?
            "/candidates/$candid/$visit/recordings/$filename/bidsfiles/json" : null
        );

        $obj['InsertTime'] = date('c', (int) $obj['InsertTime']);

        return json_encode($obj);
    }

    /**
     * Returns the CenterID for this row, for filters such as
     * \LORIS\Data\Filters\UserSiteMatch to match again.
     *
     * @return integer The CenterID
     */
    public function getCenterID(): int
    {
        return intval($this->_centerid);
    }
}
