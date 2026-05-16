// Agentic Website Configuration for AIDynamic.pro
window.AGENTIC_CONFIG = {
  siteId: 'aidynamic-pro',
  
  track: {
    searches: true,
    clicks: true,
    scrollDepth: true,
    forms: true,
    timeOnPage: true
  },
  
  optimize: {
    metaTitle: true,
    metaDescription: true,
    ctaButtons: true,
    contentPriority: true,
    schemaOrg: true
  },
  
  targetKeywords: [
    'AI solutions for business',
    'website agents',
    'process automation',
    'AI chatbots',
    'AI consulting',
    'business automation',
    'intelligent automation',
    'AI implementation'
  ],
  
  ctaVariants: [
    'Start Your Project',
    'Get Free Estimate',
    'Book Consultation',
    'See Solutions',
    'Transform Your Business'
  ],
  
  schemaTypes: {
    homepage: 'Organization',
    services: 'Service',
    contact: 'ContactPage'
  },
  
  rules: [
    {
      condition: 'search_contains("automation" OR "workflow" OR "efficiency")',
      action: 'update_headline_to: "Automate Your Business"',
      priority: 'high'
    },
    {
      condition: 'search_contains("chatbot" OR "AI assistant" OR "customer service")',
      action: 'highlight_service: "chatbots"',
      priority: 'high'
    },
    {
      condition: 'click_rate("pricing") > 0.3',
      action: 'move_section_up: "pricing"',
      priority: 'medium'
    },
    {
      condition: 'bounce_rate > 0.6',
      action: 'simplify_hero_section',
      priority: 'high'
    }
  ]
};

if (typeof AgenticWebsite !== 'undefined') {
  window.agentic = new AgenticWebsite(window.AGENTIC_CONFIG);
}
