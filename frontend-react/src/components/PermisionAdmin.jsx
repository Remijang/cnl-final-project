import React, { useEffect, useState } from "react";
import {
  getPermission,
  toggleLinkEnable,
  toggleVisibility,
} from "../services/permissionService";

import { deleteCalendar } from "../services/calendarService";

const CalendarAdmin = ({ token, calendar, setReload }) => {
  // State to manage the publicity status
  const [isPublic, setIsPublic] = useState(false);
  const [readLinkEnable, setReadLinkEnable] = useState(false);
  const [writeLinkEnable, setWriteLinkEnable] = useState(false);
  // State to manage potential loading/copying messages
  const [copyMessage, setCopyMessage] = useState("");

  const [readKey, setReadKey] = useState("");
  const [writeKey, setWriteKey] = useState("");
  const calendarId = calendar.id;

  const readLinkPrefix = `claim/${calendarId}/read/`;
  const writeLinkPrefix = `claim/${calendarId}/write/`;
  const urlPrefix = process.env.REACT_APP_CLAIM_URL || "";

  const [removeConfirmWindow, setRemoveConfirmWindow] = useState(false);
  const [removeCalendar, setRemoveCalendar] = useState(null);

  const fetchPermission = async () => {
    try {
      const publicityRes = await getPermission(token, calendarId, "visibility");
      setIsPublic(publicityRes.visibility);
      const readLinkEnableRes = await getPermission(token, calendarId, "read");
      setReadLinkEnable(readLinkEnableRes.read_link_enable);
      if (readLinkEnableRes.read_link_enable) {
        await setReadKey(`${readLinkEnableRes.read_link}`);
      }
      const writeLinkEnableRes = await getPermission(
        token,
        calendarId,
        "write"
      );
      setWriteLinkEnable(writeLinkEnableRes.write_link_enable);
      if (writeLinkEnableRes.write_link_enable) {
        await setWriteKey(`${writeLinkEnableRes.write_link}`);
      }
    } catch (err) {
      console.log(
        `Failed to fetch permissions for calendar ${calendarId}:`,
        err
      );
    }
  };

  useEffect(() => {
    fetchPermission();
  }, []);

  const handleTogglePublicity = async () => {
    const togglePublicity = !isPublic;
    setIsPublic(togglePublicity);
    try {
      await toggleVisibility(token, calendarId, togglePublicity);
    } catch (err) {
      console.log(
        `Failed to toggle visibility for calendar ${calendarId}:`,
        err
      );
    }
  };

  const handleToggleReadLink = async () => {
    const toggleReadLink = !readLinkEnable;
    try {
      const toggleReadLinkRes = await toggleLinkEnable(
        token,
        calendarId,
        "read",
        toggleReadLink
      );
      console.log(toggleReadLinkRes);
      if (toggleReadLink) {
        await setReadKey(`${toggleReadLinkRes.read_link}`);
      } else {
        await setReadKey("");
      }
      setReadLinkEnable(toggleReadLink);
    } catch (err) {
      console.log(
        `Failed to toggle read link for calendar ${calendarId}:`,
        err
      );
    }
  };

  const handleToggleWriteLink = async () => {
    const toggleWriteLink = !writeLinkEnable;
    try {
      const toggleWriteLinkRes = await toggleLinkEnable(
        token,
        calendarId,
        "write",
        toggleWriteLink
      );
      if (toggleWriteLink) {
        await setWriteKey(`${toggleWriteLinkRes.write_link}`);
      } else {
        await setWriteKey("");
      }
      setWriteLinkEnable(toggleWriteLink);
    } catch (err) {
      console.log(
        `Failed to toggle read link for calendar ${calendarId}:`,
        err
      );
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Link copied!");
      setTimeout(() => setCopyMessage(""), 2000); // Clear message after 2 seconds
    } catch (err) {
      setCopyMessage("Failed to copy link.");
      console.error("Could not copy text: ", err);
    }
  };

  const handleClickRemove = async (calendar) => {
    console.log("handleClickRemove called with calendar:", calendar);
    await setRemoveCalendar(calendar);
    await setRemoveConfirmWindow(true);
  };

  const handleRemoveCalendar = async () => {
    const calendarToRemove = removeCalendar;
    await setRemoveCalendar(null); // Reset the calendar to be removed
    try {
      console.log("Removing calendar:", calendarToRemove);
      await deleteCalendar(token, calendarToRemove.id);
      await setReload(true); // Reload calendars after deletion
    } catch (err) {
      console.error("Failed to delete calendar:", err);
      setMessage({
        type: "error",
        text: `Failed to delete calendar: ${err.message || "Unknown error"}`,
      });
      return;
    } finally {
      await setRemoveConfirmWindow(false); // Close the confirmation window
    }
  };

  const handleCancelRemove = async () => {
    await setRemoveCalendar(null); // Reset the calendar to be removed
    await setRemoveConfirmWindow(false); // Close the confirmation window
  };
  return (
    <div>
      {/* Toggle Publicity Button */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
        <span className="text-lg font-medium text-gray-700">
          Toggle Calendar Publicity
        </span>
        <button
          onClick={handleTogglePublicity}
          className={`px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 ease-in-out
                      ${
                        isPublic // Assuming 'isPublic' is the primary toggle for visibility of links
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 hover:bg-gray-500"
                      }`}
        >
          {isPublic ? "Public" : "Private"}
        </button>
      </div>

      <div className="space-y-6 animate-fade-in pb-4">
        {/* Read-only Link */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <label
            htmlFor="readLink"
            className="block text-sm font-medium text-gray-700 md:w-1/4"
          >
            Read Link
          </label>
          <div className="flex flex-grow items-stretch space-x-2 w-full md:w-3/4">
            <input
              id="readLink"
              type="text"
              value={
                readLinkEnable ? `${urlPrefix}${readLinkPrefix}${readKey}` : ""
              }
              readOnly
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-sm bg-gray-50 cursor-text"
            />
            <button
              onClick={() =>
                copyToClipboard(`${urlPrefix}${readLinkPrefix}${readKey}`)
              }
              className="flex-shrink-0 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition duration-200 text-sm font-medium shadow-sm"
            >
              Copy {/* Made button text consistent */}
            </button>
            <button
              onClick={handleToggleReadLink}
              className={`px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 ease-in-out
                      ${
                        readLinkEnable // Assuming 'isPublic' is the primary toggle for visibility of links
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 hover:bg-gray-500"
                      }`}
            >
              {readLinkEnable ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>

        {/* Read/Write Link */}
        {/* This section is now a direct child of the common 'isPublic' conditional div */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <label
            htmlFor="writeLink" // Corrected ID for uniqueness
            className="block text-sm font-medium text-gray-700 md:w-1/4"
          >
            Write Link {/* Consistent text casing */}
          </label>
          <div className="flex flex-grow items-stretch space-x-2 w-full md:w-3/4">
            <input
              id="writeLink" // Corrected ID for uniqueness
              type="text"
              value={
                writeLinkEnable
                  ? `${urlPrefix}${writeLinkPrefix}${writeKey}`
                  : ""
              }
              readOnly
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-sm bg-gray-50 cursor-text"
            />
            <button
              onClick={() =>
                copyToClipboard(`${urlPrefix}${writeLinkPrefix}${writeKey}`)
              }
              className="flex-shrink-0 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition duration-200 text-sm font-medium shadow-sm"
            >
              Copy
            </button>
            <button
              onClick={handleToggleWriteLink}
              className={`px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 ease-in-out
                      ${
                        writeLinkEnable // Assuming 'isPublic' is the primary toggle for visibility of links
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 hover:bg-gray-500"
                      }`}
            >
              {writeLinkEnable ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => handleClickRemove(calendar)}
          className="px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 ease-in-out bg-red-600 hover:bg-red-700"
        >
          Remove Calendar
        </button>
      </div>

      {removeConfirmWindow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Delete Calendar
            </h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelRemove}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveCalendar}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Display copy message here, typically outside the conditional link section */}
      {copyMessage && (
        <div className="mt-4 text-center text-sm font-medium text-green-600 animate-fade-in">
          {copyMessage}
        </div>
      )}
    </div>
  );
};

export default CalendarAdmin;
