package com.myapps.checklisttool.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class ThymeleafController {
    
    @GetMapping("/privacy-policy")
    public String privacyPolicyContent() {
        return "privacy-policy"; // This refers to privacy-policy.html in src/main/resources/templates
    }

    @GetMapping("/terms")
    public String termsContent() {
        return "terms"; // This refers to terms.html in src/main/resources/templates
    }

    @GetMapping("/support")
    public String supportContent() {
        return "support"; // This refers to support.html in src/main/resources/templates
    }
}
