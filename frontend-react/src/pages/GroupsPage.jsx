import React, { useState } from "react";
import GroupManager from "../components/GroupManager";
import { checkGroupAvailability } from "../services/availabilityService";

const GroupsPage = ({ token }) => {
  const [availabilityData, setAvailabilityData] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [currentGroupForAvailability, setCurrentGroupForAvailability] = useState(null);

  const handleCheckGroupAvailability = async (groupId, groupName) => {
    if (!token) {
      alert("Authentication token is missing.");
      return;
    }
    const day = window.prompt(`請輸入查詢群組 "${groupName}" 空閒時段的日期 (YYYY-MM-DD)：`);
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      if (day !== null && day !== "") alert("日期格式不正確，請使用 YYYY-MM-DD 格式。");
      return;
    }

    setIsLoadingAvailability(true);
    setAvailabilityError(null);
    setAvailabilityData(null); // Clear previous data
    setCurrentGroupForAvailability({ id: groupId, name: groupName, day });

    try {
      const data = await checkGroupAvailability(token, groupId, day);
      setAvailabilityData(data);
    } catch (err) {
      console.error("查詢群組空閒時段失敗：", err);
      setAvailabilityError(err.message || "無法取得空閒時段資訊");
      setAvailabilityData(null);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  return (
    <div>
      {/* GroupManager will list groups and allow member management */}
      {/* It needs to be adapted to call onCheckAvailability from GroupsPage */}
      <GroupManager token={token} onCheckAvailability={handleCheckGroupAvailability} />

      {currentGroupForAvailability && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>
            群組 "{currentGroupForAvailability.name}" (ID: {currentGroupForAvailability.id}) 於 {currentGroupForAvailability.day} 的空閒時段
          </h3>
          {isLoadingAvailability && <p>載入空閒時段中...</p>}
          {availabilityError && <p style={{ color: 'red' }}>錯誤：{availabilityError}</p>}
          {availabilityData && (
            <div>
              <h4>查詢結果：</h4>
              {Array.isArray(availabilityData) && availabilityData.length > 0 ? (
                <ul>
                  {availabilityData.map((slot, index) => (
                    <li key={index}>
                      成員 ID: {slot.user_id} | 日期: {slot.available_date} | 時間: {slot.start_time} - {slot.end_time}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>此日期群組成員沒有設定空閒時段，或所有成員皆無空閒。</p>
              )}
            </div>
          )}
          {/* Message when a query was made but no data/error and not loading */}
          {!isLoadingAvailability && !availabilityError && currentGroupForAvailability && !availabilityData && (
            <p>無法載入空閒時段資訊，或此群組在此日期無人有空。</p>
          )}
        </div>
      )}
      {/* Message to prompt user if no group has been checked yet and not loading/error */}
      {!currentGroupForAvailability && !isLoadingAvailability && !availabilityError && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <p>請在上方群組列表中點擊群組旁的 "查詢空閒時段" 按鈕以載入資訊。</p>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;