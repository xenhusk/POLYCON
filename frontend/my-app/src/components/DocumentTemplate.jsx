import React from 'react';
import logo from './image1.png';

const DocumentTemplate = ({
  sessionDate,
  venue,
  concern,
  actionTaken,
  outcome,
  remarks,
  summary,
  teacherInfo,
  studentInfo
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      style={{
        width: '8.5in',
        height: '11in',
        padding: '36pt 72pt 72pt 72pt',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.15',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20pt' }}>
        <img 
            src={logo} 
            alt="STI Logo" 
            style={{ width: '93.85px', height: '79.5px' }}
        />
        <div>
            <p style={{ 
                margin: '0px', 
                color: 'rgb(17, 85, 204)', 
                fontFamily: '"Times New Roman", serif', 
                fontSize: '10pt' 
            }}>
                College of Information and Communications Technology
            </p>
            <p style={{ 
                margin: '0px', 
                color: 'rgb(17, 85, 204)', 
                fontFamily: '"Times New Roman", serif', 
                fontSize: '10pt' 
            }}>
                Burgos Street, Bacolod City,
            </p>
            <p style={{ 
                margin: '0px', 
                color: 'rgb(17, 85, 204)', 
                fontFamily: '"Times New Roman", serif', 
                fontSize: '10pt' 
            }}>
                Negros Occidental, Philippines 6100
            </p>
            <p style={{ 
                margin: '0px', 
                color: 'rgb(17, 85, 204)', 
                fontFamily: '"Times New Roman", serif', 
                fontSize: '10pt' 
            }}>
                Tel. (034) 434 4561 local 143
            </p>
        </div>
    </div>

      {/* Title & Date/Venue */}
      <p style={{
            paddingTop: '6pt',
            paddingBottom: '10pt',
            borderTop: '1pt solid #000',
            lineHeight: '2.0',
            textAlign: 'center',
            margin: 0,
        }}>
            <span style={{
                fontSize: '10pt',
                fontFamily: 'Arial, sans-serif',
                fontWeight: '700',
                color: '#000000',
            }}>
                FACULTY-STUDENT ACADEMIC CONSULTATION RECORD
            </span>
        </p>

        {/* Date and Venue in two columns */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            margin: 0,
            fontFamily: 'Arial, sans-serif',
            fontSize: '10pt',
            fontWeight: '700',
        }}>
            <div style={{ flex: 1 }}>
                DATE: {formatDate(sessionDate)}
            </div>
            <div style={{ flex: 1 }}>
                VENUE: {venue}
            </div>
        </div>

      {/* Table for Concern, Action Taken, Outcome */}
      <table
        style={{
          borderCollapse: 'collapse',
          width: '468pt',
          marginTop: '6pt',
        }}
      >
        <tbody>
          {/* CONCERN */}
          <tr>
            <td
              style={{
                padding: '5pt',
                border: '1pt solid #000',
                backgroundColor: '#cfe2f3',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: '10pt',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '700',
                  color: '#000000',
                }}
              >
                CONCERN:
              </span>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '5pt',
                border: '1pt solid #000',
                height: '60pt',
              }}
            >
              <span
                style={{
                  fontSize: '10pt',
                  fontFamily: 'Arial, sans-serif',
                  color: '#000000',
                }}
              >
                {concern}
              </span>
            </td>
          </tr>
          {/* ACTION TAKEN */}
          <tr>
            <td
              style={{
                padding: '5pt',
                border: '1pt solid #000',
                backgroundColor: '#cfe2f3',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: '10pt',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '700',
                  color: '#000000',
                }}
              >
                ACTION TAKEN:
              </span>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '5pt',
                border: '1pt solid #000',
                height: '60pt',
              }}
            >
              <span
                style={{
                  fontSize: '10pt',
                  fontFamily: 'Arial, sans-serif',
                  color: '#000000',
                }}
              >
                {actionTaken}
              </span>
            </td>
          </tr>
          {/* OUTCOME */}
          <tr>
            <td
              style={{
                padding: '5pt',
                border: '1pt solid #000',
                backgroundColor: '#cfe2f3',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: '10pt',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '700 ',
                  color: '#000000',
                }}
              >
                OUTCOME:
              </span>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '5pt',
                border: '1pt solid #000',
                height: '60pt',
              }}
            >
              <span
                style={{
                  fontSize: '10pt',
                  fontFamily: 'Arial, sans-serif',
                  color: '#000000',
                }}
              >
                {outcome}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* REMARKS */}
      <p
        style={{
          paddingTop: '6pt',
          fontFamily: 'Arial, sans-serif',
          fontSize: '10pt',
          fontWeight: '700',
          margin: 0,
        }}
      >
        REMARKS:
      </p>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '468pt',
          marginTop: '2pt',
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: '5pt', 
              }}
            >
              <span
                style={{
                  fontSize: '10pt',
                  fontFamily: 'Arial, sans-serif',
                  color: '#000000',
                  fontStyle: 'italic',
                  textDecorationLine: 'underline',
                }}
              >
                {remarks}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

        {/* Signature Table */}
        <table
        style={{
            borderCollapse: 'collapse',
            width: '468pt',
            marginTop: '12pt',
        }}
        >
        <tbody>
            <tr>
            <td
                style={{
                padding: '5pt',
                border: '1pt solid #000',
                width: '270pt',
                textAlign: 'center',
                }}
            >
                <span
                style={{
                    fontSize: '11pt',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: '700',
                }}
                >
                Signature Over Printed Name
                </span>
            </td>
            <td
                style={{
                padding: '5pt',
                border: '1pt solid #000',
                width: '198pt',
                textAlign: 'center',
                }}
            >
                <span
                style={{
                    fontSize: '11pt',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: '700',
                }}
                >
                Position / Program
                </span>
            </td>
            </tr>
            {studentInfo &&
            studentInfo.map((student, index) => (
                <tr key={index}>
                <td
                    style={{
                    padding: '5pt',
                    border: '1pt solid #000',
                    width: '270pt',
                    }}
                >
                    <p
                    style={{
                        margin: 0,
                        color: '#000',
                        fontFamily: '"Times New Roman", serif',
                        fontSize: '11pt',
                    }}
                    >
                    {student.firstName} {student.lastName}
                    </p>
                </td>
                <td
                    style={{
                    padding: '5pt',
                    border: '1pt solid #000',
                    width: '198pt',
                    }}
                >
                    <p
                    style={{
                        margin: 0,
                        color: '#000',
                        fontFamily: '"Times New Roman", serif',
                        fontSize: '11pt',
                    }}
                    >
                    {student.program} {student.year_section}
                    </p>
                </td>
                </tr>
            ))}
            <tr>
            <td
                style={{
                padding: '5pt',
                border: '1pt solid #000',
                width: '270pt',
                }}
            >
                <p
                style={{
                    margin: 0,
                    color: '#000',
                    fontFamily: '"Times New Roman", serif',
                    fontSize: '11pt',
                }}
                >
                {teacherInfo
                    ? `${teacherInfo.firstName || ''} ${teacherInfo.lastName || ''}`.trim() || 'Name of your Teacher/Adviser Here with his/her title'
                    : 'Name of your Teacher/Adviser Here with his/her title'}
                </p>
            </td>
            <td
                style={{
                padding: '5pt',
                border: '1pt solid #000',
                width: '198pt',
                }}
            >
                <p
                style={{
                    margin: 0,
                    color: '#000',
                    fontFamily: '"Times New Roman", serif',
                    fontSize: '11pt',
                }}
                >
                {teacherInfo
                    ? `${teacherInfo.department || 'Position of Teacher / Name Program'} ${teacherInfo.role || ''}`.trim() || 'Position of Teacher / Name Program'
                    : 'Position of Teacher / Name Program'}
                </p>
            </td>
            </tr>
        </tbody>
        </table>

    </div>
  );
};

export default DocumentTemplate;