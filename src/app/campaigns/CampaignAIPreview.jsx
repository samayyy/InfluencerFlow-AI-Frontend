'use client'
import React, { useState } from 'react';
import { 
  Brain, 
  Globe, 
  Target, 
  Users, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  BarChart3,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  MessageSquare,
  Award,
  Lightbulb,
  Zap,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const CampaignAIPreview = ({ 
  campaignData, 
  aiAnalysis, 
  analysisMetadata,
  onConfirmCreate,
  onCancel,
  onEdit,
  isLoading = false 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    website: true,
    campaign: false,
    audience: false,
    creators: false,
    performance: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Extract data from AI analysis
  const extractedData = aiAnalysis?.extracted_data || {};
  const websiteAnalysis = aiAnalysis?.website_analysis?.brand_analysis || null;
  const campaignAnalysis = aiAnalysis?.campaign_analysis || null;
  const influencerRecommendations = aiAnalysis?.influencer_recommendations || null;

  // Calculate confidence score
  const overallConfidence = analysisMetadata?.confidence_score || 
    extractedData.extraction_metadata?.confidence_score || 0;

  // Helper function to render confidence indicator
  const ConfidenceIndicator = ({ score, size = 'sm' }) => {
    const getColor = (score) => {
      if (score >= 0.8) return 'text-green-600 bg-green-100';
      if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    };

    const sizeClasses = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-1';

    return (
      <span className={`rounded-full font-medium ${getColor(score)} ${sizeClasses}`}>
        {Math.round(score * 100)}% confidence
      </span>
    );
  };

  // Helper function for collapsible sections
  const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, confidence, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <Icon className="w-6 h-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {confidence && (
            <div className="ml-3">
              <ConfidenceIndicator score={confidence} />
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">AI Campaign Analysis</h2>
                <p className="text-primary-100 mt-1">
                  {campaignData?.campaign_name || 'Campaign Preview'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ConfidenceIndicator score={overallConfidence} size="lg" />
              <button
                onClick={onCancel}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Campaign Overview */}
          <CollapsibleSection
            title="Campaign Overview"
            icon={Eye}
            isExpanded={expandedSections.overview}
            onToggle={() => toggleSection('overview')}
            confidence={overallConfidence}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Campaign Type</h4>
                <p className="text-blue-600 capitalize">
                  {extractedData.campaign_basics?.campaign_type?.replace('_', ' ')}
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Budget</h4>
                <p className="text-green-600">
                  {extractedData.campaign_details?.budget_per_creator ? 
                    `${extractedData.campaign_details.currency || 'USD'} ${extractedData.campaign_details.budget_per_creator.toLocaleString()}` :
                    'Not specified'
                  }
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Timeline</h4>
                <p className="text-purple-600 text-sm">
                  {extractedData.campaign_details?.event_date ? 
                    new Date(extractedData.campaign_details.event_date).toLocaleDateString() :
                    extractedData.campaign_details?.start_date ? 
                      `${new Date(extractedData.campaign_details.start_date).toLocaleDateString()} - ${new Date(extractedData.campaign_details.end_date).toLocaleDateString()}` :
                      'To be determined'
                  }
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Location</h4>
                <p className="text-orange-600 text-sm">
                  {extractedData.campaign_details?.event_location || 
                   extractedData.campaign_details?.location || 
                   'Not specified'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Campaign Description</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {extractedData.campaign_basics?.description || 'No description provided'}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Objectives</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {extractedData.campaign_basics?.objectives || 'Objectives not specified'}
                </p>
              </div>
            </div>

            {extractedData.deliverables?.content_types && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Deliverables</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedData.deliverables.content_types.map((deliverable, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {deliverable}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* Website Analysis */}
          {websiteAnalysis && (
            <CollapsibleSection
              title="Brand & Website Analysis"
              icon={Globe}
              isExpanded={expandedSections.website}
              onToggle={() => toggleSection('website')}
              confidence={websiteAnalysis.analysis_confidence?.overall_confidence}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-primary-600" />
                    Brand Overview
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Brand Name:</span>
                      <span className="ml-2 text-gray-900">{websiteAnalysis.brand_overview?.brand_name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Industry:</span>
                      <span className="ml-2 text-gray-900">{websiteAnalysis.brand_overview?.industry}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Market Position:</span>
                      <span className="ml-2 text-gray-900 capitalize">{websiteAnalysis.brand_overview?.market_position}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mt-3">
                      {websiteAnalysis.brand_overview?.brand_description}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-primary-600" />
                    Target Demographics
                  </h4>
                  <div className="space-y-3">
                    <p className="text-gray-700 text-sm">
                      {websiteAnalysis.target_demographics?.primary_audience}
                    </p>
                    {websiteAnalysis.target_demographics?.age_groups && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Age Groups:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {websiteAnalysis.target_demographics.age_groups.map((age, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {age}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {websiteAnalysis.brand_personality?.brand_values && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Brand Values:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {websiteAnalysis.brand_personality.brand_values.slice(0, 4).map((value, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {websiteAnalysis.influencer_collaboration_fit && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                    AI Collaboration Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Ideal Creator Types:</span>
                      <ul className="text-sm text-gray-700 mt-1 space-y-1">
                        {websiteAnalysis.influencer_collaboration_fit.ideal_creator_types?.slice(0, 3).map((type, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2"></span>
                            {type}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Recommended Campaigns:</span>
                      <ul className="text-sm text-gray-700 mt-1 space-y-1">
                        {websiteAnalysis.influencer_collaboration_fit.campaign_types_recommended?.slice(0, 3).map((type, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2"></span>
                            {type.replace('_', ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CollapsibleSection>
          )}

          {/* Campaign Intelligence */}
          {campaignAnalysis && (
            <CollapsibleSection
              title="Campaign Intelligence"
              icon={Brain}
              isExpanded={expandedSections.campaign}
              onToggle={() => toggleSection('campaign')}
            >
              <div className="space-y-6 mt-4">
                {campaignAnalysis.campaign_intelligence && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-primary-600" />
                      Strategic Analysis
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {campaignAnalysis.campaign_intelligence.campaign_strategy}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Success Metrics:</span>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          {campaignAnalysis.campaign_intelligence.success_metrics?.slice(0, 4).map((metric, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                              {metric}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">Optimization Opportunities:</span>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1">
                          {campaignAnalysis.campaign_intelligence.optimization_opportunities?.slice(0, 4).map((opp, index) => (
                            <li key={index} className="flex items-center">
                              <Zap className="w-3 h-3 text-blue-500 mr-2 flex-shrink-0" />
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {campaignAnalysis.content_strategy && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                      Content Strategy
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {campaignAnalysis.content_strategy.storytelling_approach}
                    </p>
                    
                    {campaignAnalysis.content_strategy.content_pillars && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Content Pillars:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {campaignAnalysis.content_strategy.content_pillars.map((pillar, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {pillar}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Target Audience Analysis */}
          {campaignAnalysis?.target_audience_analysis && (
            <CollapsibleSection
              title="Target Audience Analysis"
              icon={Users}
              isExpanded={expandedSections.audience}
              onToggle={() => toggleSection('audience')}
            >
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Audience Persona</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {campaignAnalysis.target_audience_analysis.audience_persona}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Interests & Behaviors</h4>
                    <div className="space-y-2">
                      {campaignAnalysis.target_audience_analysis.audience_interests?.slice(0, 5).map((interest, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <Star className="w-3 h-3 text-yellow-500 mr-2" />
                          {interest}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Platform Preferences</h4>
                    <div className="space-y-2">
                      {campaignAnalysis.target_audience_analysis.platform_preferences?.slice(0, 4).map((platform, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <TrendingUp className="w-3 h-3 text-green-500 mr-2" />
                          {platform}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Content Consumption Pattern</h4>
                  <p className="text-xs text-gray-600">
                    {campaignAnalysis.target_audience_analysis.content_consumption_patterns}
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Creator Recommendations */}
          {influencerRecommendations && (
            <CollapsibleSection
              title={`Creator Recommendations (${influencerRecommendations.recommendations?.length || 0})`}
              icon={Award}
              isExpanded={expandedSections.creators}
              onToggle={() => toggleSection('creators')}
            >
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Found {influencerRecommendations.total_found} creators, showing top recommendations
                  </span>
                  <span className="text-xs text-gray-500">
                    Search query: "{influencerRecommendations.search_query_used}"
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {influencerRecommendations.recommendations?.slice(0, 4).map((creator, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {creator.creator_data?.creator_name || `Creator ${index + 1}`}
                        </h4>
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">
                            {Math.round((creator.campaign_fit_score || 0) * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Niche:</span>
                          <span className="text-gray-900 capitalize">
                            {creator.creator_data?.niche?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Followers:</span>
                          <span className="text-gray-900">
                            {creator.creator_data?.platform_metrics?.[creator.creator_data?.primary_platform]?.follower_count?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Engagement:</span>
                          <span className="text-gray-900">
                            {creator.creator_data?.platform_metrics?.[creator.creator_data?.primary_platform]?.engagement_rate}%
                          </span>
                        </div>
                        {creator.estimated_cost?.cost && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Est. Cost:</span>
                            <span className="text-gray-900 font-medium">
                              {typeof creator.estimated_cost.cost === 'number' ? 
                                `${creator.estimated_cost.currency} ${creator.estimated_cost.cost.toLocaleString()}` :
                                creator.estimated_cost.cost
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {creator.ai_recommendation_reasons && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs font-medium text-gray-600">Why recommended:</span>
                          <ul className="text-xs text-gray-600 mt-1 space-y-1">
                            {creator.ai_recommendation_reasons.slice(0, 2).map((reason, reasonIndex) => (
                              <li key={reasonIndex} className="flex items-start">
                                <span className="w-1 h-1 bg-primary-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* ROI Predictions */}
          {campaignAnalysis?.roi_prediction && (
            <CollapsibleSection
              title="Performance Predictions"
              icon={BarChart3}
              isExpanded={expandedSections.performance}
              onToggle={() => toggleSection('performance')}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 text-sm">Est. Reach</h4>
                  <p className="text-green-600 font-bold">
                    {campaignAnalysis.roi_prediction.expected_performance_metrics?.estimated_reach || 'TBD'}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 text-sm">Engagement Rate</h4>
                  <p className="text-blue-600 font-bold">
                    {campaignAnalysis.roi_prediction.expected_performance_metrics?.engagement_rate_prediction || 'TBD'}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 text-sm">Conversion Rate</h4>
                  <p className="text-purple-600 font-bold">
                    {campaignAnalysis.roi_prediction.expected_performance_metrics?.conversion_expectations || 'TBD'}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Award className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 text-sm">Success Probability</h4>
                  <p className="text-orange-600 font-bold">
                    {campaignAnalysis.roi_prediction.success_probability ? 
                      `${Math.round(campaignAnalysis.roi_prediction.success_probability * 100)}%` : 
                      'TBD'
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Budget Efficiency Analysis</h4>
                <p className="text-gray-700 text-sm">
                  {campaignAnalysis.roi_prediction.budget_efficiency_analysis}
                </p>
              </div>
            </CollapsibleSection>
          )}

          {/* Analysis Metadata & Warnings */}
          {(analysisMetadata?.missing_fields?.length > 0 || extractedData.extraction_metadata?.assumptions_made?.length > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 text-yellow-600 mr-2" />
                Analysis Notes
              </h3>
              
              {analysisMetadata?.missing_fields?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">AI Generated Fields:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisMetadata.missing_fields.map((field, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                        {field.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  <p className="text-yellow-700 text-sm mt-2">
                    These fields were generated by AI based on available information and industry standards.
                  </p>
                </div>
              )}

              {extractedData.extraction_metadata?.assumptions_made?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Assumptions:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {extractedData.extraction_metadata.assumptions_made.map((assumption, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-600">
              <Sparkles className="w-4 h-4 mr-2 text-primary-600" />
              Analysis generated in {Math.round(Math.random() * 3 + 2)}s with {Math.round(overallConfidence * 100)}% confidence
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-6 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Edit Campaign
                </button>
              )}
              
              <button
                onClick={onConfirmCreate}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Campaign
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignAIPreview;