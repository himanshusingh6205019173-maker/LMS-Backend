package com.lms.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SettingsDto {
    private String siteName;
    private String supportEmail;
    private boolean allowRegistration;
    private boolean maintenanceMode;
}