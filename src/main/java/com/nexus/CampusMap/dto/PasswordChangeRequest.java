package com.nexus.CampusMap.dto;

public class PasswordChangeRequest {
    private String oldPassword;
    private String newPassword;


    // Getter and Setter
    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}