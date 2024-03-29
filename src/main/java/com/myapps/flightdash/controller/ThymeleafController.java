package com.myapps.flightdash.controller;

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

     @GetMapping("/openai-usage-policy")
    public String openAIUsagePolicyContent() {
        return "openai-usage-policy"; // This refers to openai-usage-policy.html in src/main/resources/templates
    }

    @GetMapping("/vat-track")
    public String vatTrackContent() {
        return "vat-track"; // This refers to openai-usage-policy.html in src/main/resources/templates
    }
}
